"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Set channel names
 */
class ChannelName extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'channelname',
            category: 'Admin',
            description: 'Rename channels',
            usage: ['cname <channelID> <newName>'],
            args: true,
            guildOnly: true,
            permsNeeded: ['MANAGE_CHANNELS']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { standardMessage } = client.Utils;
        // * ------------------ Logic --------------------
        const channelName = args.shift();
        const newName = args.join(' ').replace(/ /g, '\u2009');
        const channel = client.channels.get(channelName);
        channel.setName(newName);
        return standardMessage(msg, `Channel name changed to ${newName}`);
    }
}
exports.default = ChannelName;
