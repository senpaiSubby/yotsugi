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
class SabNZBD extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'sab',
            category: 'Download',
            description: 'sabNZBD Management',
            usage: [`sab list`],
            aliases: ['nzb'],
            args: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { p, Utils, Log } = client;
        const { errorMessage, warningMessage, validOptions, missingConfig, sortByKey, embed, paginate } = Utils;
        // * ------------------ Config --------------------
        const { host, apiKey } = client.db.config.sabnzbd;
        // * ------------------ Check Config --------------------
        if (!host || !apiKey) {
            const settings = [
                `${p}config set sabnzbd host <http://ip>`,
                `${p}config set sabnzbd apiKey <APIKEY>`
            ];
            return missingConfig(msg, 'sabnzbd', settings);
        }
        // * ------------------ Logic --------------------
        const getQueue = async () => {
            try {
                const endpoint = '/api?output=json&mode=queue';
                const response = await unirest_1.get(url_join_1.default(host, endpoint, `&apikey=${apiKey}`));
                const data = response.body;
                const downloadQueue = [];
                if (data) {
                    data.queue.slots.forEach((key) => {
                        downloadQueue.push({
                            filename: key.filename,
                            index: key.index,
                            status: key.status,
                            percentage: key.percentage,
                            time: { left: key.timeleft, eta: key.eta },
                            size: { total: key.size, left: key.sizeleft }
                        });
                    });
                    return sortByKey(downloadQueue, '-index');
                }
            }
            catch (e) {
                const text = 'Could not connect to sabNZBD';
                Log.error('sabNZBD', text, e);
                await errorMessage(msg, text);
            }
        };
        // * ------------------ Usage Logic --------------------
        switch (args[0]) {
            case 'list': {
                const data = await getQueue();
                if (data) {
                    if (!data.length)
                        return warningMessage(msg, `Nothing in download Queue`);
                    const embedList = [];
                    data.forEach((item) => {
                        const { filename, status, percentage, time, size } = item;
                        embedList.push(embed('green', 'sabnzbd.png')
                            .setTitle('SabNZBD Queue')
                            .addField('Filename', `${filename}`, false)
                            .addField('Status', `${status}`, true)
                            .addField('Percentage', `${percentage}`, true)
                            .addField('Size Total', `${size.total}`, true)
                            .addField('Size Left', `${size.left}`, true)
                            .addField('Time Left', `${time.left}`, true)
                            .addField('ETA', `${time.eta}`, true));
                    });
                    return paginate(msg, embedList);
                }
                return;
            }
            default:
                return validOptions(msg, ['list']);
        }
    }
}
exports.default = SabNZBD;
