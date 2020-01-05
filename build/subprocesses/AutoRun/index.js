"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const later_1 = __importDefault(require("later"));
const database_1 = __importDefault(require("../../core/database"));
const Subprocess_1 = require("../../core/Subprocess");
class AutoRun extends Subprocess_1.Subprocess {
    constructor(client) {
        super(client, {
            name: 'AutoRun',
            description: 'Schedule commands to run at specified times',
            disabled: false
        });
        this.commandManager = client.commandManager;
    }
    async run() {
        const { Log } = this.client;
        const { ownerID } = this.client.config;
        const { GeneralConfig } = database_1.default.models;
        const db = await GeneralConfig.findOne({ where: { id: ownerID } });
        if (db) {
            const config = JSON.parse(db.get('config'));
            const { autorun } = config;
            const runCommand = async (cmdName) => {
                this.client.db.config = config;
                const args = cmdName.split(' ');
                const cmd = args.shift().toLowerCase();
                const command = this.commandManager.findCommand(cmd);
                return this.commandManager.runCommand(this.client, command, null, args, true);
            };
            later_1.default.date.localTime();
            autorun.forEach((i) => {
                const { commands, time } = i;
                const sched = later_1.default.parse.text(`at ${time}`);
                commands.forEach((c) => {
                    const enabled = c[0];
                    const cmd = c[1];
                    if (enabled) {
                        later_1.default.setInterval(async () => {
                            Log.info('Auto Run', `Running [ ${time} ] command [ ${cmd} ]`);
                            const response = await runCommand(cmd);
                            Log.info('Auto Run', `[ ${cmd} ] => ${response} `);
                        }, sched);
                    }
                });
            });
        }
    }
}
exports.default = AutoRun;
