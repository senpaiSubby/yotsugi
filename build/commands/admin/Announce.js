"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Announce messages to the server
 */
class Announce extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            category: 'Admin',
            description: 'Send a message to your announcement channel',
            usage: ['announce <hey guys GIVEAWAY!>'],
            guildOnly: true,
            args: true,
            permsNeeded: ['MANAGE_GUILD']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils, db } = client;
        const { warningMessage, embed } = Utils;
        const { author, guild } = msg;
        // * ------------------ Config --------------------
        // Get server prefix and announcementChannel from database
        const { prefix, announcementChannel } = db.server;
        // * ------------------ Logic --------------------
        // If the announcement channel doesnt exists in server or isnt set
        // Notify in chat to set the channel
        if (!announcementChannel) {
            return warningMessage(msg, `It appears that you don't have an announcement channel set.
        \`${prefix}server set announcementChannel <channelID>\` to set one`);
        }
        const serverAnnouncementChannel = guild.channels.get(announcementChannel);
        // Grab everyone from the guidls default role
        const everyone = msg.guild.defaultRole;
        // Ping all users
        await serverAnnouncementChannel.send(everyone.toString());
        // Post announcement to channel
        return serverAnnouncementChannel.send(embed('blue', 'news.png')
            .setTitle('ANNOUNCEMENT!')
            .setDescription(`**${args.join(' ')}**`)
            .setTimestamp(new Date())
            .setFooter(`From ${author.tag}`, author.avatarURL));
    }
}
exports.default = Announce;
