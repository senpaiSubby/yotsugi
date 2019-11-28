const { YoutubeDataAPI } = require('youtube-v3-api')
const Command = require('../../core/Command')

module.exports = class YoutubeSearch extends Command {
  constructor(client) {
    super(client, {
      name: 'yt',
      category: 'Media',
      description: 'Search Youtube',
      usage: ['yt <video to search for>'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { paginate, embed } = Utils
    // * ------------------ Config --------------------

    const apiKey = 'AIzaSyAXLT-ow7yYEhwaqewhCwgEEYkxEaUuEyA'
    const yt = new YoutubeDataAPI(apiKey)

    // * ------------------ Check Config --------------------

    // * ------------------ Logic --------------------
    const fetchVideos = async (searchTerm) => {
      const data = await yt.searchAll(searchTerm, 25)
      const results = []
      console.log(data)
      data.items.forEach((i) => {
        const { description, channelTitle, thumbnails } = i.snippet
        const { videoId } = i.id
        const { publishedAt, title } = i.snippet
        const thumbnail = thumbnails.high.url
        results.push(
          embed(msg, 'red')
            .setTitle(`YT - ${title}`)
            .setURL(`https://youtube.com/watch?v=${videoId})`)
            .addField('Channel', channelTitle, true)
            .addField('Published', publishedAt.toString().substring(0, 10), true)
            .addField('Description', description)
            .setImage(thumbnail)
            .setThumbnail(
              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/YouTube_social_white_squircle_%282017%29.svg/1024px-YouTube_social_white_squircle_%282017%29.svg.png'
            )
        )
      })
      return paginate(client, msg, results, 2)
    }
    // * ------------------ Usage Logic --------------------
    return fetchVideos(args.join(' '))
  }
}
