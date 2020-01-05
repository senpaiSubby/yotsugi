"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transmission_promise_1 = __importDefault(require("transmission-promise"));
const Command_1 = require("../../core/Command");
class Transmission extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'tor',
            category: 'Download',
            description: 'Transmission Management',
            usage: [`tor list`, 'tor add <magnet link>'],
            aliases: ['transmission'],
            args: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { p, Utils, Log, db } = client;
        const { bytesToSize, sortByKey, errorMessage, warningMessage, validOptions, standardMessage, missingConfig, paginate, embed } = Utils;
        // * ------------------ Config --------------------
        const { host, port, ssl } = db.config.transmission;
        // * ------------------ Check Config --------------------
        if (!host || !port) {
            const settings = [
                `${p}config set transmission host <http://ip>`,
                `${p}config set transmission port <port>`,
                `${p}config set transmission ssl <true/false>`
            ];
            return missingConfig(msg, 'transmission', settings);
        }
        const trans = new transmission_promise_1.default({
            host,
            port,
            ssl,
            url: '/transmission/rpc' // Default '/transmission/rpc'
        });
        // * ------------------ Logic --------------------
        const getStatus = (code) => {
            switch (code) {
                case 0:
                    return 'stopped';
                case 1:
                    return 'checkWait';
                case 2:
                    return 'checking';
                case 3:
                    return 'downloadWait';
                case 4:
                    return 'downloading';
                case 5:
                    return 'seedWait';
                case 6:
                    return 'seeding';
                case 7:
                    return 'No Peers';
            }
        };
        // TODO add typing for Transmission wue
        const getQueue = async () => {
            try {
                const response = await trans.get();
                const { torrents } = response;
                const downloadQueue = [];
                torrents.forEach((item) => {
                    const { name, id, rateUpload, rateDownload, downloadedEver, status, sizeWhenDone } = item;
                    downloadQueue.push({
                        name,
                        id,
                        status: getStatus(status),
                        percentage: downloadedEver
                            ? Math.round((downloadedEver / sizeWhenDone) * 100).toString()
                            : '0',
                        rate: {
                            up: rateUpload ? bytesToSize(rateUpload) : 0,
                            down: rateDownload ? bytesToSize(rateDownload) : 0
                        },
                        size: {
                            current: downloadedEver ? bytesToSize(downloadedEver) : 0,
                            complete: sizeWhenDone ? bytesToSize(sizeWhenDone) : 0
                        }
                    });
                });
                return sortByKey(downloadQueue, 'percentage');
            }
            catch (e) {
                const text = 'Failed to connect to Transmission';
                Log.error('Transmission', text, e);
                await errorMessage(msg, text);
            }
        };
        const addTorrent = async (magnet) => {
            try {
                const response = await trans.addUrl(magnet);
                return standardMessage(msg, `[ ${response.name} ] Added to Transmission`);
            }
            catch (e) {
                const text = 'Failed to connect to Transmission';
                Log.error('Transmission', text, e);
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
                        const { name, id, status, percentage, rate, size } = item;
                        embedList.push(embed('green', 'transmission.png')
                            .setTitle('Transmission Queue')
                            .addField('Filename', `[ ${id} ] ${name}`, false)
                            .addField('Status', `${status}`, true)
                            .addField('Percentage', `${percentage}`, true)
                            .addField('Size Total', `${size.complete}`, true)
                            .addField('Size Current', `${size.current}`, true)
                            .addField('Rate Down', `${rate.down}`, true)
                            .addField('Rate Upload', `${rate.up}`, true));
                    });
                    return paginate(msg, embedList);
                }
                return;
            }
            case 'add':
                return addTorrent(args[1]);
            default:
                return validOptions(msg, ['list', 'add']);
        }
    }
}
exports.default = Transmission;
