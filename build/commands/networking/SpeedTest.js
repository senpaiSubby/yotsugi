"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speedtest_net_1 = __importDefault(require("speedtest-net"));
const Command_1 = require("../../core/Command");
class SpeedTest extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'speedtest',
            category: 'Networking',
            description: 'Runs a network speedtest'
        });
    }
    async run(client, msg) {
        const { Utils } = client;
        const { errorMessage, embed } = Utils;
        const test = speedtest_net_1.default({ maxTime: 5000 });
        const m = (await msg.channel.send(embed('green').setDescription(`**:desktop: Testing network throughput...**`)));
        test.on('data', async (data) => {
            const { download, upload } = data.speeds;
            const { isp, isprating } = data.client;
            const { location, ping } = data.server;
            return m.edit(embed('green', 'speedtest.png')
                .setTitle('Speedtest')
                .addField(':arrow_down: Download', `${download}`, true)
                .addField(' :arrow_up: Upload', `${upload}`, true)
                .addField(':globe_with_meridians: Ping', `${ping}`, true)
                .addField(':classical_building: ISP', `${isp}`, true)
                .addField(':star: Rating', `${isprating}`, true)
                .addField(':flag_us: Location', `${location}`, true));
        });
        test.on('error', async () => errorMessage(msg, `Failed to speedtest`));
    }
}
exports.default = SpeedTest;
