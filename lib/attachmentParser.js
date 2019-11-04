const torrent2magnet = require('torrent2magnet')

module.exports = async (client, msg, url) => {
  const torrentMagnet = async (url) => {
    try {
      const response = await torrent2magnet(url)
      return response
    } catch {
      return 'failure'
    }
  }
  const name = url.split('/').pop()

  //* if file is torrent then add to Transmission
  if (name.endsWith('.torrent')) {
    const torrent = await torrentMagnet(url)
    const command = client.commands.get('tor')
    command.execute(client, msg, ['add', torrent], null)
  }
}
