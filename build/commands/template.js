"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../core/Command");
class Template extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'template',
            category: '',
            description: 'Template',
            usage: [],
            aliases: [],
            args: true,
            disabled: true,
            ownerOnly: true,
            guildOnly: true,
            webUI: false
        });
    }
    async run(client, msg, args, api) {
        // * ------------------ Setup --------------------
        const { Utils } = client;
        const { author, channel } = msg;
        // * ------------------ Config --------------------
        // * ------------------ Check Config --------------------
        // * ------------------ Logic --------------------
        // * ------------------ Usage Logic --------------------
    }
}
exports.default = Template;
