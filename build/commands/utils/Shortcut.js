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
const database_1 = __importDefault(require("../../core/database/"));
class Shortcut extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'shortcut',
            aliases: ['s'],
            category: 'Utils',
            usage: ['s list', 's add <name> <command>', 's remove <name>'],
            description: 'Shortcut to run specific commands',
            args: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils } = client;
        const { warningMessage, standardMessage, errorMessage, embed } = Utils;
        const { author, context, channel } = msg;
        // * ------------------ Config --------------------
        const db = await database_1.default.models.GeneralConfig.findOne({ where: { id: author.id } });
        const { config } = client.db;
        const { shortcuts } = config;
        // * ------------------ Logic --------------------
        // * ------------------ Usage Logic --------------------
        switch (args[0]) {
            case 'list': {
                if (!shortcuts.length)
                    return warningMessage(msg, `There are no shortcuts!`);
                const e = embed('green', 'shortcut.png').setTitle('Shortcuts');
                shortcuts.forEach((i) => e.addField(`${i.name}`, `${i.command} ${i.arg.join(' ')}`), true);
                return channel.send(e);
            }
            case 'add': {
                const name = args[1];
                const command = args[2];
                const index = shortcuts.findIndex((i) => i.name === name);
                if (index > -1)
                    return warningMessage(msg, `Shortcut [ ${name} ] already exists`);
                args.splice(0, 3);
                const arg = args.join(' ');
                shortcuts.push({ name, command, arg: arg.split(' ') });
                await db.update({ config: JSON.stringify(config) });
                return standardMessage(msg, `[ ${name} ] added to shortcut list`);
            }
            case 'remove': {
                const name = args[1];
                const index = shortcuts.findIndex((d) => d.name === name);
                if (index === -1)
                    return warningMessage(msg, `Shortcut [ ${name} ] doesn't exist`);
                shortcuts.splice(index, 1);
                await db.update({ config: JSON.stringify(config) });
                if (name)
                    return standardMessage(msg, `[ ${name} ] removed from shortcut list`);
                break;
            }
            default: {
                const index = shortcuts.findIndex((i) => i.name === args[0]);
                if (index === -1)
                    return warningMessage(msg, `Shortcut doesn't exist`);
                const { command, arg } = shortcuts[index];
                const cmd = context.findCommand(command);
                if (cmd)
                    return context.runCommand(client, cmd, msg, arg);
                return errorMessage(msg, `Command [ ${command} ] doesn't exist`);
            }
        }
    }
}
exports.default = Shortcut;
