"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class Evaluator extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            category: 'Owner',
            description: 'Eval javascript code',
            ownerOnly: true
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { channel } = msg;
        // * ------------------ Usage Logic --------------------
        const regex = new RegExp(client.config.token
            .replace(/\./g, '\\.')
            .split('')
            .join('.?'), 'g');
        const input = `📥 **Input:**\n\`\`\`js\n${args.join(' ')}\n\`\`\``;
        const error = (err) => `🚫 **Error:**\n\`\`\`js\n${err.toString().replace(regex, '[Token]')}\n\`\`\``;
        try {
            let output = await eval(args.join(' '));
            if (typeof output !== 'string')
                output = require('util').inspect(output, { depth: 1 });
            const response = `📤 **Output:**\n\`\`\`js\n${output.replace(regex, '[Token]')}\n\`\`\``;
            if (input.length + response.length > 1900)
                throw new Error('Output too long!');
            return channel
                .send(`${input}\n${response}`)
                .catch((err) => channel.send(`${input}\n${error(err)}`));
        }
        catch (err) {
            return channel
                .send(`${input}\n${error(err)}`)
                .catch((e) => channel.send(`${input}\n${error(e)}`));
        }
    }
}
exports.default = Evaluator;
