"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
/**
 * Clear messages from channels
 */
class Clear extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'clear',
            category: 'Admin',
            description: 'Removes messages',
            usage: [`clear <0-100>`, 'clear <@user> <0-100>'],
            aliases: ['rm', 'delete'],
            guildOnly: true,
            args: true,
            permsNeeded: ['MANAGE_MESSAGES']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        await msg.delete();
        const { warningMessage, asyncForEach } = client.Utils;
        const { channel } = msg;
        // * ------------------ Logic --------------------
        // We cant clear messages in DM's so just ignore
        if (channel.type === 'dm')
            return;
        // If user is mentioned then assign them for the deletion
        const user = msg.mentions.users.first();
        // Get the amount of messages to delete
        const amount = user ? args[1] : args[0];
        // Check if the number of messages specified is a number
        if (user && isNaN(args[1]))
            return warningMessage(msg, 'The amount parameter isn`t a number!');
        if (!user && isNaN(args[0]))
            return warningMessage(msg, 'The amount parameter isn`t a number!');
        // We cant delete more than 100 messages at once so notify user
        if (amount > 100)
            return warningMessage(msg, 'You can`t delete more than 100 messages at once!');
        // Check if the user specified atleast 1 message to be deleted
        if (amount < 1)
            return warningMessage(msg, 'You have to delete at least 1 msg!');
        // Search channel for messages from user if specified or target number of messages
        const foundMessages = await channel.fetchMessages({ limit: user ? 100 : amount });
        // If a user was specified filter messages by their user
        if (user) {
            const filterBy = user ? user.id : client.user.id;
            const messagesToDelete = foundMessages
                .filter((m) => m.author.id === filterBy)
                .array()
                .slice(0, amount);
            return asyncForEach(messagesToDelete, async (message) => await message.delete());
        }
        // Delete messages
        return foundMessages.forEach(async (message) => await message.delete());
    }
}
exports.default = Clear;
