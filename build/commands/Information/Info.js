"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_worker_1 = __importDefault(require("core-worker"));
const moment_1 = require("moment");
const Command_1 = require("../../core/Command");
Promise.resolve().then(() => __importStar(require('moment-duration-format')));
class Info extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'info',
            category: 'Information',
            description: 'Info about Nezuko',
            usage: ['info']
        });
    }
    async run(client, msg) {
        // * ------------------ Setup --------------------
        const { Utils, user } = client;
        const { embed } = Utils;
        const { channel, context } = msg;
        const { round } = Math;
        const { memoryUsage } = process;
        // * ------------------ Logic --------------------
        const npmv = await core_worker_1.default.process('npm -v').death();
        return channel.send(embed('green')
            .setTitle(`Nezuko Status`)
            .setThumbnail(user.avatarURL)
            .addField('Uptime', moment_1.duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
            .addField('Memory Usage', `${round(memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
            .addField('Node Version', process.version.replace('v', ''), true)
            .addField('NPM Version', npmv.data.replace('\n', ''), true)
            .addField('Commands', context.commands.size, true)
            .setDescription(`Nezuko! Created to automate my life [GITHUB](https://github.com/callmekory/nezuko)`));
    }
}
exports.default = Info;
