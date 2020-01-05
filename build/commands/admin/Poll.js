"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Poll your users
 */
class Poll extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            category: 'Admin',
            description: 'Poll your members',
            usage: ['poll <whats the poll for?>'],
            permsNeeded: ['ADMINISTRATOR']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        // Delete original message
        await msg.delete();
        const { embed } = client.Utils;
        // * ------------------ Logic --------------------
        // Create embed for poll
        const pollembed = embed('green')
            .setFooter('React to vote')
            .setDescription(args.join(' '))
            .setTitle(`Poll created by ${msg.author.username}`)
            .setTimestamp(msg.createdAt);
        // Await the message
        const m = (await msg.channel.send(pollembed));
        // Wait for reactions
        await m.react('✅');
        await m.react('❌');
    }
}
exports.default = Poll;
