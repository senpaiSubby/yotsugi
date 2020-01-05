"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = __importStar(require("./config/config.json"));
const discord_js_1 = require("discord.js");
const CommandManager_1 = require("./core/managers/CommandManager");
const ConfigManager_1 = require("./core/managers/ConfigManager");
const SubprocessManager_1 = require("./core/managers/SubprocessManager");
const Logger_1 = require("./core/utils/Logger");
const Utils_1 = require("./core/utils/Utils");
const guildMemberAdd_1 = require("events/guildMemberAdd");
const guildMemberRemove_1 = require("events/guildMemberRemove");
const database_1 = require("./core/database/database");
class NezukoClient extends discord_js_1.Client {
    constructor() {
        super();
        this.config = config;
        this.Log = Logger_1.Log;
        this.Utils = Utils_1.Utils;
        this.commandManager = new CommandManager_1.CommandManager(this);
        this.db = {};
        this.generalConfig = database_1.database.models.GeneralConfig;
        this.serverConfig = database_1.database.models.ServerConfig;
        this.memberConfig = database_1.database.models.MemberConfig;
        // Log discord warnings
        this.on('warn', (info) => console.log(`warn: ${info}`));
        this.on('reconnecting', () => console.log(`client tries to reconnect to the WebSocket`));
        this.on('resume', (replayed) => {
            console.log(`whenever a WebSocket resumes, ${replayed} replays`);
        });
        // Unhandled Promise Rejections
        process.on('unhandledRejection', (reason) => {
            this.Log.error('Unhandled Rejection', reason);
        });
        // Unhandled Errors
        process.on('uncaughtException', (error) => {
            this.Log.error('Uncaught Exception', error);
        });
    }
    /**
     * Starts Nezuko
     */
    start() {
        const { handleMessage } = this.commandManager;
        // Login
        this.login(this.config.token);
        // Once bot connects to discord
        this.once('ready', async () => {
            Logger_1.Log.ok('Client Ready', `Connected as [ ${this.user.username} ]`);
            // Handle general config
            ConfigManager_1.ConfigManager.handleGeneralConfig();
            // * ---------- Events ----------
            // On message
            this.on('message', async (message) => await handleMessage(message, this, true));
            // On message edits
            this.on('messageUpdate', async (old, _new) => {
                if (old.content !== _new.content)
                    await this.commandManager.handleMessage(_new, this);
            });
            this.on('guildMemberAdd', async (member) => await guildMemberAdd_1.guildMemberAdd(member));
            this.on('guildMemberRemove', async (member) => await guildMemberRemove_1.guildMemberRemove(member));
            // * ---------- Load and start subprocessess ----------
            await new SubprocessManager_1.SubprocessManager(this).loadModules();
        });
    }
}
exports.NezukoClient = NezukoClient;
