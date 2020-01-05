"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const unirest_1 = require("unirest");
const Command_1 = require("../../core/Command");
class SystemIP extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'ip',
            category: 'Networking',
            description: 'Get the server IP',
            usage: [`ip <external/local>`],
            ownerOnly: true,
            args: false,
            webUI: true
        });
    }
    async run(client, msg, args, api) {
        // * ------------------ Setup --------------------
        const { warningMessage } = client.Utils;
        // * ------------------ Logic --------------------
        const response = await unirest_1.get('https://ifconfig.co/json').headers({
            accept: 'application/json'
        });
        const data = response.body;
        if (api)
            return data.ip;
        return warningMessage(msg, `[ ${data.ip} ]`);
    }
}
exports.default = SystemIP;
