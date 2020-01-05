"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const Command_1 = require("../../core/Command");
const node_os_utils_1 = require("node-os-utils");
const systeminformation_1 = __importDefault(require("systeminformation"));
class SystemInfo extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'system',
            category: 'Utils',
            description: 'Live system stats',
            usage: ['si <interval in seconds>'],
            args: true,
            aliases: ['si']
        });
    }
    async run(client, msg, args, api) {
        // * ------------------ Setup --------------------
        const { bytesToSize, embed } = client.Utils;
        const { channel, author } = msg;
        const { round } = Math;
        // * ------------------ Config --------------------
        // * ------------------ Check Config --------------------
        // * ------------------ Logic --------------------
        const cpuInfo = async () => {
            const coreCount = node_os_utils_1.cpu.count();
            const cpuPercent = round(await node_os_utils_1.cpu.usage());
            let loadAverage = '';
            node_os_utils_1.cpu.loadavg().forEach((i) => (loadAverage += `${round(i)}% `));
            return { cores: coreCount, percentage: cpuPercent, load: loadAverage.trim() };
        };
        const ramInfo = async () => {
            const ram = await systeminformation_1.default.mem();
            return {
                total: bytesToSize(ram.total),
                used: bytesToSize(ram.active),
                free: bytesToSize(ram.available)
            };
        };
        // * ------------------ Usage Logic --------------------
        if (api) {
            return {
                cpu: await cpuInfo(),
                ram: await ramInfo()
            };
        }
        const ms = (await channel.send(embed('green').setDescription('**:timer: Loading system stats..**')));
        await ms.react('🛑');
        const refreshEmbed = async () => {
            const cpuStats = await cpuInfo();
            const ramStats = await ramInfo();
            const { cores, percentage, load } = cpuStats;
            const { total, free, used } = ramStats;
            await ms.edit(embed('green')
                .setTitle(':computer: Live System Stats')
                .addField('Host', `**[${os_1.hostname()}] ${os_1.type()} ${os_1.arch()} ${os_1.release()}**`)
                .addField('CPU Cores', cores, true)
                .addField('CPU Usage', percentage, true)
                .addField('CPU Load', load, true)
                .addField('RAM Total', total, true)
                .addField('RAM Free', free, true)
                .addField('RAM Used', used, true));
        };
        await refreshEmbed();
        const interval = setInterval(async () => refreshEmbed(), args[0] * 1000);
        const collected = await ms.awaitReactions((reaction, user) => ['🛑'].includes(reaction.emoji.name) && user.id === author.id, { max: 1 });
        const foundReaction = collected.first();
        if (foundReaction) {
            if (foundReaction.emoji.name === '🛑') {
                clearInterval(interval);
                return ms.clearReactions();
            }
        }
    }
}
exports.default = SystemInfo;
