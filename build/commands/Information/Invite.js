"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class Invite extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            category: 'Information',
            description: 'Invite Nezuko to your own server'
        });
    }
    async run(client, msg) {
        // * ------------------ Setup --------------------
        const { embed } = client.Utils;
        const { channel } = msg;
        // * ------------------ Logic --------------------
        const invite = await client.generateInvite([
            'MANAGE_MESSAGES',
            'CREATE_INSTANT_INVITE',
            'KICK_MEMBERS',
            'BAN_MEMBERS',
            'MANAGE_CHANNELS',
            'MANAGE_GUILD',
            'MANAGE_MESSAGES',
            'MANAGE_ROLES'
        ]);
        return channel.send(embed('green')
            .setTitle('Nezuko')
            .setDescription('Thanks for showing interest in Nezuko! Click the link below to invite her to your server.')
            .setThumbnail(client.user.avatarURL)
            .addField('\u200b', `[Click Here](${invite})`));
    }
}
exports.default = Invite;
