"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Unban users
 */
class Unban extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'unban',
            category: 'Admin',
            description: 'Unban users',
            usage: ['unban <userID> <reason for unban>'],
            guildOnly: true,
            args: true,
            permsNeeded: ['BAN_MEMBERS']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { warningMessage, embed } = client.Utils;
        const { db } = client;
        const { author, channel, guild } = msg;
        // * ------------------ Config --------------------
        const { prefix, logChannel } = db.server;
        // * ------------------ Check Config --------------------
        // If logchannel is not set for server or doesnt exist
        if (!logChannel) {
            return warningMessage(msg, `It appears that you do not have a Log channel.
        Please set one with \`${prefix}server set logChannel <channelID>\``);
        }
        const serverLogChannel = msg.guild.channels.get(logChannel);
        // * ------------------ Logic --------------------
        // Member to ban
        const target = msg.mentions.members.first();
        // Reason for ban
        const reason = args.slice(1).join(' ');
        // If no user or reason specified
        if (!target)
            return warningMessage(msg, `Please specify a member to unban!`);
        if (!reason)
            return warningMessage(msg, `Please specify a reason for this unban!`);
        // Fetch the guild bans
        const bans = await msg.guild.fetchBans();
        // Check if the specified user is banned
        let isBanned = false;
        bans.forEach((user) => {
            if (user.id === target.user.id)
                isBanned = true;
        });
        // If the member is banned then unban and send notice to log channel
        if (isBanned) {
            await guild.unban(target, reason);
            return serverLogChannel.send(embed('green')
                .addField('Unbanned Member', `**${target.user.username}** with an ID: ${target.id}`)
                .addField('Unbanned By', `**${author.username}** with an ID: ${author.id}`)
                .addField('Unbanned Time', msg.createdAt)
                .addField('Unbanned At', channel)
                .addField('Unbanned Reason', reason));
        } // Else notify that the member isnt banned
        return warningMessage(msg, `User [ ${target.user.tag} ] isn't banned`);
    }
}
exports.default = Unban;
