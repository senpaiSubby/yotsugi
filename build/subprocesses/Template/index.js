"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Subprocess_1 = require("../../core/Subprocess");
class Template extends Subprocess_1.Subprocess {
    constructor(client) {
        super(client, {
            name: 'Template',
            description: 'Template',
            disabled: true
        });
        this.client = client;
    }
    async run() { }
}
exports.default = Template;
