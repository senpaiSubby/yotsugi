"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unirest_1 = require("unirest");
const url_join_1 = __importDefault(require("url-join"));
const Command_1 = require("../../core/Command");
class Emby extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'emby',
            category: 'Media',
            description: 'Emby media info',
            usage: ['emby streams', 'emby stats', 'emby recent <movies/series>'],
            args: true,
            webUI: true
        });
    }
    async run(client, msg, args, api) {
        // * ------------------ Setup --------------------
        const { p, Utils, Log } = client;
        const { channel } = msg;
        const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig, embed, capitalize } = Utils;
        // * ------------------ Config --------------------
        const { apiKey, host, userID } = client.db.config.emby;
        // * ------------------ Check Config --------------------
        if (!host || !apiKey || !userID) {
            const settings = [
                `${p}config set emby host <http://ip>`,
                `${p}config set emby apiKey <APIKEY>`,
                `${p}config set emby userID <USERID>`
            ];
            return missingConfig(msg, 'emby', settings);
        }
        const headers = { 'X-Emby-Token': apiKey, accept: 'application/json' };
        // * ------------------ Logic --------------------
        const getLink = (item) => {
            const { Id, serverId } = item;
            return url_join_1.default(host, `/web/index.html#!/itemdetails.html?id=${Id}&context=tvshows&serverId=${serverId}`);
        };
        const fetchData = async (endPoint) => {
            try {
                const response = await unirest_1.get(`${url_join_1.default(host, 'jellyfin', endPoint)}`).headers(headers);
                switch (response.status) {
                    case 200: {
                        return response.body;
                    }
                    case 401: {
                        const text = 'Bad API key';
                        if (api)
                            return text;
                        await warningMessage(msg, text);
                        Log.error('Emby', text);
                        break;
                    }
                    default: {
                        const text = 'Failed to connect to Emby';
                        if (api)
                            return text;
                        Log.error('Emby', text);
                        await errorMessage(msg, text);
                    }
                }
            }
            catch (e) {
                const text = 'Failed to connect to Emby';
                if (api)
                    return text;
                Log.error('Emby', text);
                await errorMessage(msg, text);
            }
        };
        // * ------------------ Usage Logic --------------------
        let e;
        if (!api) {
            e = embed('green', 'emby.png');
        }
        switch (args[0]) {
            case 'streams': {
                const nowPlaying = (await fetchData('/Sessions'));
                if (nowPlaying) {
                    let currentStreamCount = 0;
                    const currentStreams = [];
                    nowPlaying.forEach((i) => {
                        if (i.NowPlayingItem) {
                            currentStreamCount++;
                            currentStreams.push({
                                user: capitalize(i.UserName),
                                client: i.Client,
                                device: i.DeviceName,
                                item: i.NowPlayingItem.Name
                            });
                        }
                    });
                    if (api)
                        return { currentStreamCount, currentStreams };
                    if (!currentStreamCount)
                        return standardMessage(msg, 'Nothing is playing');
                    e.setTitle(`Emby Stats - Current Streams [ ${currentStreamCount} ]`);
                    currentStreams.forEach((i) => {
                        e.addField(`\u200b`, `**Username**
              - ${i.user}
              **Client Type**
              - ${i.client}
              **Device Name**
              - ${i.device}
              **Playing Item**
              - ${i.item}\n`, true);
                    });
                    return channel.send(e);
                }
                return;
            }
            case 'stats': {
                const stats = (await fetchData('/Items/Counts'));
                if (stats) {
                    const { MovieCount, SeriesCount, EpisodeCount, ArtistCount, SongCount, BookCount } = stats;
                    return channel.send(embed()
                        .setTitle('Emby Stats')
                        .addField(':film_frames: Movies', MovieCount, true)
                        .addField(':dvd: Series', SeriesCount, true)
                        .addField(':desktop: Episodes', EpisodeCount, true)
                        .addField(':microphone2:  Artists', ArtistCount, true)
                        .addField(':musical_note: Songs', SongCount, true)
                        .addField(':blue_book: Books', BookCount, true));
                }
                return;
            }
            // TODO add typing for emby recent
            case 'recent': {
                const mediaType = args[1] === 'movies' ? 'Movie' : args[1] === 'series' ? 'Episode' : '';
                const endpoint = `/Users/${userID}/Items/Latest`;
                const params = `?IncludeItemTypes=${mediaType}&Limit=10&IsPlayed=false&GroupItems=false`;
                const stats = await fetchData(endpoint + params);
                if (stats) {
                    switch (args[1]) {
                        case 'movies': {
                            e.setTitle('Recently added movies');
                            let text = '';
                            stats.forEach((key, index) => (text += `${index + 1}. [LINK](${getLink(key)}) - ${key.Name}\n`));
                            e.setDescription(text);
                            return channel.send(e);
                        }
                        case 'series': {
                            e.setTitle('Recently added series');
                            stats.forEach((key) => {
                                e.addField(`${key.SeriesName}`, `- ${key.Name}\n- [Link](${getLink(key)})`, true);
                            });
                            return channel.send(e);
                        }
                        default:
                            return validOptions(msg, ['series', 'movies']);
                    }
                }
                return;
            }
            default: {
                return validOptions(msg, ['streams', 'stats', 'recent']);
            }
        }
    }
}
exports.default = Emby;
