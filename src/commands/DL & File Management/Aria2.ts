/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Aria2 from 'aria2'
import { BotClient } from 'core/BotClient'
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

export default class Template extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['dl'],
      args: true,
      category: 'DL & File Management',
      description: 'Aria2 download management',
      name: 'aria',
      usage: []
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
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
    } = Utils

    // Load config from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, port, secure, secret, saveDir } = config.aria2

    // If required config params arn't set notify user
    if (!host || !port || !saveDir) {
      const settings = [
        `${p}config set aria2 host <ip>`,
        `${p}config set aria2 port <port>`,
        `${p}config set aria2 saveDir </path/to/save/files>`
      ]
      return missingConfig(msg, 'aria2', settings)
    }

    // Initialize new Aria2 connection
    const aria2 = new Aria2({ host, port, secure, secret: secret || '', path: '/jsonrpc' })

    try {
      /**
       * Adds a file to Aria2's download queue via url
       */
      const addFile = async (fileURL: string) =>
        aria2.call('addUri', [fileURL], {
          dir: saveDir
        })

      /**
       * Removed a file from Aria2's download queue via GID
       */
      const remove = async (downloadGID: string) => aria2.call('removeDownloadResult', downloadGID)

      /**
       * Get the status of a download via GID
       * error codes are paused, active, complete, waiting, error
       */
      const getStatus = async (downloadGID: string) => {
        try {
          const status = await aria2.call('tellStatus', downloadGID)
          return status
        } catch {
          return
        }
      }

      /**
       * Pauses a download via download GID
       */
      const pauseDownload = async (downloadGID: string) => {
        try {
          const response = await aria2.call('pause', downloadGID)
          if (response === downloadGID) return true
        } catch {}
      }

      /**
       * Unpauses a download via download GID
       */
      const unpauseDownload = async (downloadGID: string) => {
        try {
          const response = await aria2.call('unpause', downloadGID)
          if (response === downloadGID) return true
        } catch {}
      }

      const pauseAll = async () => await aria2.call('pauseAll')
      const unpauseAll = async () => await aria2.call('unpauseAll')
      const getWaitingDownloads = async () => await aria2.call('tellWaiting', 0, 100)
      const getStoppedDownloads = async () => await aria2.call('tellStopped', 0, 100)
      const getActiveDownloads = async () => await aria2.call('tellActive')

      const command = args.shift()

      switch (command) {
        // Fetches the global stats for arias
        case 'stats': {
          // Fetch global stats
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
        // Adds a download via url
        case 'add': {
          if (args[0]) {
            // Add download and fetch GID of download
            const gid = await addFile(args[0])

            // Sleep for 1 seconds for changes to propogate
            await sleep(1000)

            // Fetch the info of the new download
            const info = await getStatus(gid)

            // If download addition is successfull
            if (!info.errorMessage) {
              // Send download information
              return channel.send(
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 Download Manager')
                  .setDescription(`Added\n[ ${args.join()} ]`)
                  .addField('Download Dir', info.dir, true)
                  .addField('GID', info.gid, true)
                  .addField('Status', info.status, true)
              )
            }

            // If url isn't a valid download link
            return errorMessage(msg, `The link [ ${args[0]} ] ins\'t a valid download link`)
          }

          // If user doesn't specify a download link
          return warningMessage(msg, 'Please specify a link to download')
        }
        // Fetches information for download via GID
        case 'status': {
          // If GID specified
          if (args[0]) {
            // Fetch download status
            const status = await getStatus(args[0])

            // If we have status information
            if (status) {
              // Send download info
              return channel.send(
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 Download Manager')
                  .addField('URL', status.files[0].uris[0].uri)
                  .addField('GID', status.gid, true)
                  .addField('Status', status.status, true)
                  .addField('Download Dir', status.dir, true)
                  .addField(
                    'Download Speed',
                    `${status.downloadSpeed === '0' ? bytesToSize(status.downloadSpeed) : '0 kb'}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(status.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )
            }

            // If GID is invalid
            return warningMessage(msg, `The GID [ ${args[0]} ] is invalid`)
          }

          // If user didn't specify a download GID
          return warningMessage(msg, 'Please specify the GID of the download to get info on')
        }
        // Removes a download from the download queue
        case 'remove': {
          // Grab GID from user args
          const gid = args[0]

          // If GID specified
          if (gid) {
            // Fetch download stats
            const status = await getStatus(gid)

            // If stats for provided GID
            if (status) {
              // If download isnt in error or already removed
              // Remove download
              if (!['error', 'removed'].includes(status.status)) {
                await remove(gid)
                return standardMessage(msg, 'green', `Removed the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              // Else it is already removed or in error
              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be removed`
              )
            }

            // If provided GID is invalid
            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          // If user didn't specify a download GID
          return warningMessage(msg, 'Please specify the GID of the download to remove')
        }
        // Pauses  a download via GID
        case 'pause': {
          // Get GID from user args
          const gid = args[0]

          // If user procided a GID
          if (gid) {
            // Fetch download status
            const status = await getStatus(gid)

            // If download exists
            if (status) {
              // If status isnt paused, complete, error or removed, pause download
              if (!['paused', 'complete', 'error', 'removed'].includes(status.status)) {
                await pauseDownload(gid)
                return standardMessage(msg, 'green', `Paused the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              // Else the download cannot be paused
              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be paused`
              )
            }

            // If the GID provided isn't correct
            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          // If user didn't specify a GID
          return warningMessage(msg, 'Please specify the GID of the download to pause')
        }
        // Pauses all downloads
        case 'pauseall': {
          await pauseAll()
          return standardMessage(msg, 'green', 'Paused all Aria2 downloads')
        }
        // Resumes a download
        case 'resume': {
          // Get GID from user args
          const gid = args[0]

          // If user specified a GID
          if (gid) {
            // Fetch download status
            const status = await getStatus(gid)
            // If download exists
            if (status) {
              // If download is able to be resumed
              if (!['complete', 'error', 'active', 'waiting', 'removed'].includes(status.status)) {
                await unpauseDownload(gid)
                return standardMessage(msg, 'green', `Resumed the download of file [ ${status.files[0].uris[0].uri} ]`)
              }

              // Else download is in a state that cannot be resumed
              return warningMessage(
                msg,
                `The file [ ${
                  status.files[0].uris[0].uri
                } ] is currently [ ${status.status.toUpperCase()} ] so it cannot be resumed`
              )
            }

            // If provided GID is incorrect
            return warningMessage(msg, `The GID [ ${gid} ] is invalid`)
          }

          // If user didn't specify a GID
          return warningMessage(msg, 'Please specify the GID of the download to resume')
        }
        // Resumes all downloads
        case 'resumeAll': {
          await unpauseAll()
          return standardMessage(msg, 'green', 'Resumed all Aria2 downloads')
        }
        // Lists all download in specified state
        case 'list': {
          // Fetch state from user args
          const status = args[0]

          switch (status) {
            // Lists all active downloads
            case 'active': {
              // Fetch all active downloads
              const downloads = await getActiveDownloads()

              // Create embed list
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Active Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? '0 kb' : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              // If any active downloads then return them
              if (embedList.length) return paginate(msg, embedList)

              // Else there are no active downloads
              return warningMessage(msg, 'There are no active downloads')
            }
            // Lists all waiting downloads
            case 'waiting': {
              // Fetch waiting downloads
              const downloads = await getWaitingDownloads()

              // Generate embed list
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Waiting Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? '0 kb' : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              // If any waiting downloads return them
              if (embedList.length) return paginate(msg, embedList)

              // Else no downloasd are waiting
              return warningMessage(msg, 'There are no waiting downloads')
            }
            // Lists all stopped downloads
            case 'stopped': {
              // Fetch all stoppped downloads
              const downloads = await getActiveDownloads()

              // Generate embed list
              const embedList = downloads.map((d) =>
                embed(msg, 'green', 'aria2.png')
                  .setTitle('Aria2 - Stopped Downloads')
                  .addField('URL', d.files[0].uris[0].uri)
                  .addField('GID', d.gid, true)
                  .addField('Status', d.status, true)
                  .addField('Download Dir', d.dir, true)
                  .addField(
                    'Download Speed',
                    `${d.downloadSpeed === '0' ? '0 kb' : bytesToSize(d.downloadSpeed)}/s`,
                    true
                  )
                  .addField('Total Size', bytesToSize(d.totalLength), true)
                  .addField('Downloaded', bytesToSize(2567520256), true)
              )

              // If any stopped downloads return them
              if (embedList.length) return paginate(msg, embedList)

              // Else there are no stopped downloads
              return warningMessage(msg, 'There are no stopped downloads')
            }
            // If user doesn't choose any options above
            default: {
              // Return correct usage
              return validOptions(msg, ['active', 'stopped', 'waiting'])
            }
          }
        }
        // If user didn't choose any of the above options
        default: {
          // Return correct usage
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
      // If client cannot connect to Aria2 ith the provided details
      return errorMessage(msg, 'Failed to connect to Aria2. Are you sure your host and port details are correct?')
    }
  }
}
