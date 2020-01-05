"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class UserAvatar extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            category: 'Information',
            description: 'Show the avatar of users',
            usage: [`avatar`, `avatar @user`],
            guildOnly: true
        });
    }
    async run(client, msg) {
        // * ------------------ Setup --------------------
        const { embed, warningMessage } = client.Utils;
        const { author, channel } = msg;
        // * ------------------ Logic --------------------
        const member = msg.mentions.members.first() || msg.guild.member(author);
        if (!member.user.avatar)
            return warningMessage(msg, "This user doesn't have an avatar!");
        const avatar = member.user.avatarURL;
        return channel.send(embed('green')
            .setAuthor(`${member.user.tag}`, avatar)
            .setDescription(`[Avatar URL](${avatar})`)
            .setImage(avatar));
    }
}
exports.default = UserAvatar;
