const { get } = require('unirest')
const urljoin = require('url-join')
const puppeteer = require('puppeteer')
const { writeFileSync, existsSync, mkdirSync } = require('fs')
const { dirname } = require('path')
const Magnet2torrent = require('magnet2torrent-js')
const Command = require('../../core/Command')

module.exports = class Jackett extends Command {
  constructor(client) {
    super(client, {
      name: 'jackett',
      category: 'Download',
      description: 'Search for torrents via Jackett',
      usage: ['find <torrent to look for>'],
      aliases: ['find'],
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------
    const { Utils, Log, db, p } = client
    const { channel } = msg
    const {
      bytesToSize,
      sortByKey,
      embed,
      paginate,
      errorMessage,
      standardMessage,
      warningMessage,
      missingConfig
    } = Utils

    // * ------------------ Config --------------------

    const { host, apiKey } = db.config.jackett

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [
        `${p}config set jackett host <http://ip>`,
        `${p}config set jackett apiKey <APIKEY>`
      ]
      return missingConfig(msg, 'jackett', settings)
    }

    // * ------------------ Logic --------------------
    const fetchResults = async (term) => {
      try {
        const response = await get(
          urljoin(host, `/api/v2.0/indexers/all/results?apikey=${apiKey}&Query=${term}`)
        ).headers({ accept: 'application/json' })
        const { Results } = response.body

        if (Results.length) {
          const filteredResults = []
          Results.forEach((i) => {
            const { Tracker, Title, Guid, Size, Seeders, Peers } = i
            filteredResults.push({
              name: Title,
              tracker: Tracker,
              link: Guid,
              size: bytesToSize(Size),
              seeders: Seeders,
              peers: Peers
            })
          })
          return sortByKey(filteredResults, 'seeders')
        }
        await warningMessage(msg, `No results for [ ${term} ]`)
      } catch (e) {
        const text = 'Could not connect to Jackett'
        Log.error('Jackett', text, e)
        await errorMessage(msg, text)
      }
    }

    const getTorrent = async (link, fileName) => {
      let index
      let links
      try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(link)
        links = await page.evaluate(() =>
          // eslint-disable-next-line no-undef
          Array.from(document.querySelectorAll('a')).map((anchor) => anchor.href)
        )

        index = links.findIndex((x) => x.includes('magnet:'))
        await browser.close()
      } catch (e) {
        const text = 'Could not find a magnet link of the page'
        Log.error('Jackett', text, e)
        await errorMessage(msg, text)
      }
      if (index !== -1) {
        try {
          const m2t = new Magnet2torrent()
          const buffer = await m2t.getTorrentBuffer(links[index])
          const path = `./data/logs/torrents/${fileName}.torrent`

          if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true })

          writeFileSync(path, buffer)
          return path
        } catch (e) {
          const text = 'Failed to download .torrent file'
          Log.error('Jackett', text, e)
          await errorMessage(msg, text)
        }
      }
    }

    // * ------------------ Usage Logic --------------------
    const results = await fetchResults(args.join(' '))

    if (results) {
      const embedList = []
      results.forEach((i) => {
        const { name, tracker, link, size, seeders, peers } = i
        embedList.push(
          embed('green', 'torrent.png')
            .setTitle(`Torrent Results [ ${args.join(' ')} ]`)
            .addField('Name', `[${name}](${link})`, false)
            .addField('Tracker', tracker, true)
            .addField('Size', size, true)
            .addField('Seeder | Peers', `${seeders} | ${peers}`, true)
        )
      })
      const choice = await paginate(msg, embedList, true)
      if (choice || choice === 0) {
        const m = await standardMessage(msg, '⏳ Fetching torrent file....')
        const filePath = await getTorrent(results[choice].link, results[choice].name)
        if (filePath) {
          await m.delete()
          return channel.send({ files: [filePath] })
        }
        await m.delete()
      }
    }
  }
}
