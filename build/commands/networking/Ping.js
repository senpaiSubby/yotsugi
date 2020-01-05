"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class Ping extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            category: 'Networking',
            description: 'Check discord latency',
            ownerOnly: true
        });
    }
    async run(client, msg) {
        // * ------------------ Setup --------------------
        const { standardMessage } = client.Utils;
        const { createdTimestamp } = msg;
        // * ------------------ Logic --------------------
        return standardMessage(msg, `Pong! Your ping is [ ${Date.now() - createdTimestamp} ] ms`);
    }
}
exports.default = Ping;
