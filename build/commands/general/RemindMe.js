"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
const ms_1 = __importDefault(require("ms"));
class RemindMe extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'remindme',
            category: 'General',
            description: 'Set some reminders',
            usage: [
                'remindme 10s do the dishes',
                'remindme 1h make memes',
                'remindme 1m get funky with it'
            ],
            aliases: ['remind']
        });
    }
    async run(client, msg, args) {
        const { Utils } = client;
        const { standardMessage, embed } = Utils;
        const { author } = msg;
        msg.delete(10000);
        const timer = args[0];
        const notice = args.splice(1, 1000).join(' ');
        const m = (await standardMessage(msg, `**:white_check_mark:  I'll DM you in [ ${ms_1.default(ms_1.default(timer), {
            long: true
        })} ] to [ ${notice} ]**`));
        m.delete(10000);
        setTimeout(() => author.send(embed('green').setDescription(`**It's been [ ${ms_1.default(ms_1.default(timer), {
            long: true
        })} ] Here's your reminder to [ ${notice} ]**`)), ms_1.default(timer));
    }
}
exports.default = RemindMe;
