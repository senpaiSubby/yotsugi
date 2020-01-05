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
const dateformat_1 = __importDefault(require("dateformat"));
const moment_1 = require("moment");
class UserInfo extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'user',
            category: 'Information',
            description: 'Get info on yourself and others',
            usage: [`userinfo`, `userinfo @user`],
            guildOnly: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { warningMessage, embed } = client.Utils;
        const { member, channel } = msg;
        // * ------------------ Logic --------------------
        const user = args[0] ? msg.mentions.members.first() : member;
        if (!user)
            return warningMessage(msg, `Did not find a user with that query`);
        const inGuild = msg.guild.members.has(user.id);
        const roles = user.roles.map((role) => role.name);
        const e = embed('green')
            .setTitle(`${user.user.tag}'s User Info`)
            .setThumbnail(user.user.avatarURL)
            .addField('ID:', `${user.id}`, true)
            .addField('Nickname:', `${user.nickname !== null ? `${user.nickname}` : 'None'}`, true)
            .addField('Status:', `${user.presence.status}`, true)
            .addField('In Server', user.guild.name, true)
            .addField('Bot:', `${user.user.bot ? 'True' : 'False'}`, true)
            .addField('Joined', `${moment_1.utc(user.joinedAt).format('MMMM DD YY')}`, true)
            .addField('Roles', `- ${roles.join('\n- ')}`, true);
        if (inGuild) {
            const rMember = msg.guild.members.get(user.user.id);
            const memSort = msg.guild.members
                .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
                .array();
            let position = 0;
            for (const guildember of memSort) {
                position++;
                if (guildember.id === user.id)
                    break;
            }
            e.addField('Joined At', dateformat_1.default(rMember.joinedAt), true).addField('Joined Position', position, true);
        }
        return channel.send(e);
    }
}
exports.default = UserInfo;
