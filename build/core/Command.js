"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(client, data) {
        this.client = client;
        this.name = data.name;
        this.category = data.category || '';
        this.description = data.description;
        this.aliases = data.aliases || [];
        this.args = data.args || false;
        this.webUI = data.webUI || false;
        this.usage = data.usage || [];
        this.guildOnly = data.guildOnly || false;
        this.ownerOnly = data.ownerOnly || false;
        this.permsNeeded = data.permsNeeded || [];
        this.disabled = data.disabled || false;
    }
}
exports.Command = Command;
