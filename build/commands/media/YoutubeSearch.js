"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
const youtube_v3_api_1 = require("youtube-v3-api");
class YoutubeSearch extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'yt',
            category: 'Media',
            description: 'Search Youtube videos',
            usage: ['yt <video to search for>'],
            args: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils, db, p } = client;
        const { paginate, embed, missingConfig } = Utils;
        // * ------------------ Config --------------------
        const { apiKey } = db.config.google;
        const yt = new youtube_v3_api_1.YoutubeDataAPI(apiKey);
        // * ------------------ Check Config --------------------
        if (!apiKey) {
            const settings = [`${p}config set google apiKey <key>`];
            return missingConfig(msg, 'google', settings);
        }
        // * ------------------ Logic --------------------
        const fetchVideos = async (searchTerm) => {
            const data = (await yt.searchAll(searchTerm, 25));
            const results = [];
            for (const i of data) {
                const { description, channelTitle, thumbnails } = i.snippet;
                const { videoId } = i.id;
                const { publishedAt, title } = i.snippet;
                const thumbnail = thumbnails.high.url;
                results.push(embed('red', 'youtube.png')
                    .setTitle(`YT - ${title}`)
                    .setURL(`https://youtube.com/watch?v=${videoId})`)
                    .addField('Channel', channelTitle, true)
                    .addField('Published', publishedAt.toString().substring(0, 10), true)
                    .addField('Description', description || 'No Description..')
                    .setImage(thumbnail));
            }
            return paginate(msg, results);
        };
        // * ------------------ Usage Logic --------------------
        return fetchVideos(args.join(' '));
    }
}
exports.default = YoutubeSearch;
