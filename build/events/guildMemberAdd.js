"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../core/database/database");
const Utils_1 = require("../core/utils/Utils");
exports.guildMemberAdd = async (member) => {
    const { embed } = Utils_1.Utils;
    const db = await database_1.database.models.ServerConfig.findOne({ where: { id: member.guild.id } });
    const { welcomeChannel, prefix } = JSON.parse(db.get('config'));
    const e = embed()
        .setColor('RANDOM')
        .setThumbnail(member.guild.iconURL)
        .setAuthor(member.user.username, member.user.avatarURL)
        .setTitle(`Welcome To ${member.guild.name}!`)
        .setDescription(`Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`);
    const channel = member.guild.channels.get(welcomeChannel);
    return channel.send(e);
};
