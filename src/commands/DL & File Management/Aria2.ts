/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Aria2 from 'aria2'
import { BotClient } from 'core/BotClient'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'

export default class Template extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'aria',
      category: 'DL & File Management',
      description: 'Control Aria2 downloads',
      usage: [],
      aliases: ['dl'],
      args: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[], api: boolean) {
    const { channel, p } = msg
    const {
      embed,
      bytesToSize,
      paginate,
      warningMessage,
      errorMessage,
      standardMessage,
      validOptions,
      sleep,
      missingConfig
    } = client.Utils

    // * ------------------ Config --------------------

    const { host, port, secure, secret, saveDir } = client.db.config!.aria2

    // * ------------------ Check Config --------------------

    if (!host || !port || !saveDir) {
      const settings = [
        `${p}config set aria2 host <ip>`,
        `${p}config set aria2 port <port>`,
        `${p}config set aria2 saveDir </path/to/save/files>`
      ]
      return missingConfig(msg, 'aria2', settings)
    }

    const aria2 = new Aria2({ host, port, secure, secret: secret || '', path: '/jsonrpc' })

    try {
      const addFile = async (fileURL) =>
        aria2.call('addUri', [fileURL], {
          dir: saveDir
        })

      const remove = async (downloadGID) => aria2.call('removeDownloadResult', downloadGID)

      const addTorrent = async (torrentURL) => {
        const guid = await aria2.call('addTorrent', [torrentURL], {
          dir: saveDir
        })

        console.log(guid)
      }

      // Paused, active, complete, waiting, error
      const getStatus = async (downloadGID) => {
        try {
          const status = await aria2.call('tellStatus', downloadGID)
          return status
        } catch {
          return
        }
      }

      const pauseDownload = async (downloadGID) => {
        const status = await getStatus(downloadGID)

        try {
          const reponse = await aria2.call('pause', downloadGID)
          if (reponse === downloadGID) console.log('Paused my G')
        } catch {
          console.log('File cannot be paused')
        }
      }

      const unpauseDownload = async (downloadGID) => {
        try {
          const reponse = await aria2.call('unpause', downloadGID)
          if (reponse === downloadGID) console.log('Unpaused my G')
        } catch {
          console.log('File cannot be unpaused')
        }
      }

      const pauseAll = async () => await aria2.call('pauseAll')
      const unpauseAll = async () => await aria2.call('unpauseAll')
      const getAllDownloads = async () => await aria2.call('pauseAll')
      const getWaitingDownloads = async () => await aria2.call('tellWaiting', 0, 100)
      const getStoppedDownloads = async () => await aria2.call('tellStopped', 0, 100)
      const getActiveDownloads = async () => await aria2.call('tellActive')

      const command = args.shift()

      switch (command) {
        case 'stats': {
          const stats = await aria2.call('getGlobalStat')

          return channel.send(
            embed(msg, 'green', 'aria2.png')
              .setTitle('Aria2 Global Stats')
              .addField(
                'Download Speed',
                `${stats.downloadSpeed === '0' ? '0 kb' : bytesToSize(stats.downloadSpeed)}/s`
              )

              .addField('Upload Speed', `${stats.downloadSpeed === '0' ? '0 kb' : bytesToSize(stats.uploadSpeed)}/s`)
              .addField('Active', stats.numActive)
              .addField('Stopped', stats.numStopped)
              .addField('Total Stopped', stats.numStoppedTotal)
              .addField('Waiting', stats.numWaiting)
          )
        }
        case 'add': {
          if (args[0]) {
            const guid = await addFile(args[0])
            await sleep(1000)
            const info = await getStatus(guid)

            if (!info.errorMessage) {
              return channel.send(
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 Download Manager')
                  .setDescription(`Added\n[ ${args.join()} ]`)
                  .addField('Download Dir', info.dir, true)
                  .addField('GID', info.gid, true)
                  .addField('Status', info.status, true)
              )
            }

            return errorMessage(msg, `The link [ ${args[0]} ] ins\'t a valid download link`)
          }

          return warningMessage(msg, 'Please specify a link to download')
        }
        case 'status': {
          if (args[0]) {
            const status = await getStatus(args[0])

            if (status) {
              return channel.send(
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 Download Manager')
                  .addField('URL', status.files[0].uris[0].uri)
                  .addField('GID', status.gid, true)
                  .addField('Status', status.status, true)
                  .addField('Download Dir', status.dir, true)
                  .addField(
                    'Download Speed',
                    `${status.downloadSpeed === '0' ? bytesToSize(status.downloadSpeed) : `0 kb`}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(status.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )
            }

            return warningMessage(msg, `The GID [ ${args[0]} ] is invalid`)
          }

          return warningMessage(msg, `Please specify the GID of the download to get info on`)
        }
        case 'remove': {
          const gid = args[0]
          if (gid) {
            const status = await getStatus(gid)
            if (status) {
              if (!['error', 'removed'].includes(status.status)) {
                await remove(gid)
                return standardMessage(msg, 'green', `Removed the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be removed`
              )
            }

            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          return warningMessage(msg, 'Please specify the GID of the download to remove')
        }
        case 'pause': {
          const gid = args[0]
          if (gid) {
            const status = await getStatus(gid)
            if (status) {
              if (!['paused', 'complete', 'error', 'removed'].includes(status.status)) {
                await pauseDownload(gid)
                return standardMessage(msg, 'green', `Paused the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be paused`
              )
            }

            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          return warningMessage(msg, 'Please specify the GID of the download to pause')
        }
        case 'pauseall': {
          await pauseAll()
          return standardMessage(msg, 'green', 'Paused all Aria2 downloads')
        }
        case 'resume': {
          const gid = args[0]
          if (gid) {
            const status = await getStatus(gid)
            if (status) {
              if (!['complete', 'error', 'active', 'waiting', 'removed'].includes(status.status)) {
                await unpauseDownload(gid)
                return standardMessage(msg, 'green', `Resumed the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be resumed`
              )
            }

            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          return warningMessage(msg, 'Please specify the GID of the download to resume')
        }
        case 'resumeAll': {
          await unpauseAll()
          return standardMessage(msg, 'green', 'Resumed all Aria2 downloads')
        }
        case 'list': {
          const status = args[0]

          switch (status) {
            case 'active': {
              const downloads = await getActiveDownloads()
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Active Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? `0 kb` : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              if (embedList.length) return paginate(msg, embedList)
              return warningMessage(msg, 'There are no active downloads')
            }
            case 'waiting': {
              const downloads = await getWaitingDownloads()
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Waiting Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? `0 kb` : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              if (embedList.length) return paginate(msg, embedList)
              return warningMessage(msg, 'There are no waiting downloads')
            }

            case 'stopped': {
              const downloads = await getActiveDownloads()
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Stopped Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? `0 kb` : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              if (embedList.length) return paginate(msg, embedList)
              return warningMessage(msg, 'There are no stopped downloads')
            }
            default: {
              return validOptions(msg, ['active', 'stopped', 'waiting'])
            }
          }
        }
        default: {
          return validOptions(msg, [
            'stats',
            'add',
            'status',
            'remove',
            'pause',
            'pauseall',
            'resume',
            'resumeall',
            'list'
          ])
        }
      }
    } catch {
      return errorMessage(msg, 'Failed to connect to Aria2. Are you sure your host and port details are correct?')
    }
  }
}
