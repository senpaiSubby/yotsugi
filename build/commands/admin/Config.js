"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
const database_1 = require("../../core/database/database");
/**
 * Get and set server config
 */
class Config extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'server',
            category: 'Admin',
            description: 'Set/Get server config for bot',
            usage: ['server get', 'server set <key> <value'],
            args: true,
            permsNeeded: ['MANAGE_GUILD']
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils, p } = client;
        const { warningMessage, validOptions, standardMessage, embed } = Utils;
        const { channel, guild } = msg;
        const { ServerConfig } = database_1.database.models;
        // * ------------------ Config --------------------
        const db = await ServerConfig.findOne({ where: { id: guild.id } });
        const server = JSON.parse(db.get('config'));
        // * ------------------ Usage Logic --------------------
        switch (args[0]) {
            // Get the current server settings
            case 'get': {
                // Remove the server rules key to remove bloat from
                // The info embed
                delete server.rules;
                // Sort keys
                const keys = Object.keys(server).sort();
                // Info embed
                const e = embed('green', 'settings.png')
                    .setTitle('Server Config')
                    .setDescription(`**[ ${p}server set <settings> <new value> ] to change**`);
                // Add a new field to the embed for every key in the settings
                keys.forEach((i) => e.addField(`${i}`, `${server[i]}`, false));
                // Ship it off
                return channel.send(e);
            }
            // Set server settings
            case 'set': {
                // Setting to change
                const keyToChange = args[1];
                // New value
                const newValue = args[2];
                // If the setting exists
                if (keyToChange in server) {
                    // Change key to new one
                    server[keyToChange] = newValue;
                    // Update the database
                    await db.update({ config: JSON.stringify(server) });
                    // Notify the user
                    return standardMessage(msg, `[ ${keyToChange} ] changed to [ ${newValue} ]`);
                } // If the setting doesnt exist
                return warningMessage(msg, `[${keyToChange}] doesnt exist`);
            }
            // If neither 'set' or 'get' where specified as options inform the user
            // Of the correct options
            default:
                return validOptions(msg, ['get', 'set']);
        }
    }
}
exports.default = Config;
