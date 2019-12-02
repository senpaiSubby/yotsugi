const { YoutubeDataAPI } = require('youtube-v3-api')
const Command = require('../../core/Command')

module.exports = class YoutubeSearch extends Command {
  constructor(client) {
    super(client, {
      name: 'yt',
      category: 'Media',
      description: 'Search Youtube videos',
      usage: ['yt <video to search for>'],
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------
    const { Utils, db, p } = client
    const { paginate, embed, missingConfig } = Utils
    // * ------------------ Config --------------------

    const { apiKey } = db.config.google
    const yt = new YoutubeDataAPI(apiKey)

    // * ------------------ Check Config --------------------

    if (!apiKey) {
      const settings = [`${p}config set google apiKey <key>`]
      return missingConfig(msg, 'google', settings)
    }

    // * ------------------ Logic --------------------
    const fetchVideos = async (searchTerm) => {
      const data = await yt.searchAll(searchTerm, 25)
      const results = []
      data.items.forEach((i) => {
        const { description, channelTitle, thumbnails } = i.snippet
        const { videoId } = i.id
        const { publishedAt, title } = i.snippet
        const thumbnail = thumbnails.high.url
        results.push(
          embed('red', 'youtube.png')
            .setTitle(`YT - ${title}`)
            .setURL(`https://youtube.com/watch?v=${videoId})`)
            .addField('Channel', channelTitle, true)
            .addField('Published', publishedAt.toString().substring(0, 10), true)
            .addField('Description', description || 'No Description..')
            .setImage(thumbnail)
        )
      })
      return paginate(msg, results)
    }
    // * ------------------ Usage Logic --------------------
    return fetchVideos(args.join(' '))
  }
}
