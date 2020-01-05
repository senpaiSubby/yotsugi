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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = __importStar(require("../../config/config.json"));
const database_1 = __importDefault(require("../database"));
const Logger_1 = require("../utils/Logger");
/**
 * Handles setting up User, General and Server config for Nezuko
 */
class ConfigManager {
    /**
     * Handles general config
     */
    static async handleGeneralConfig() {
        await database_1.default.sync();
        const { ownerID } = config;
        const db = await database_1.default.models.GeneralConfig.findOne({ where: { id: ownerID } });
        if (!db) {
            Logger_1.Log.info('Config MAnager', `Created new general config for [ ${ownerID} ]`);
            await database_1.default.models.GeneralConfig.create({
                archivebox: { path: null },
                autorun: [],
                config: JSON.stringify({
                    id: ownerID,
                    username: 'Nezuko'
                }),
                disabledCommands: [],
                docker: { host: null },
                emby: { apiKey: null, host: null, userID: null },
                google: { apiKey: null },
                googleHome: { ip: null, language: null, name: null },
                jackett: { apiKey: null, host: null },
                lockedCommands: [],
                meraki: { apiKey: null, serielNum: null },
                ombi: { apiKey: null, host: null, username: null },
                pihole: { apiKey: null, host: null },
                pioneerAVR: { host: null },
                routines: [],
                sabnzbd: { apiKey: null, host: null },
                sengled: { jsessionid: null, password: null, username: null },
                shortcuts: [],
                systemPowerControl: [{ host: 'xxx', mac: 'xxx', name: 'xxx' }],
                transmission: { host: null, port: '9091', ssl: false },
                tuyaDevices: [{ id: 'xxxxxxx', key: 'xxx', name: 'xxx' }],
                webUI: { apiKey: '111', commands: [] }
            });
        }
    }
    /**
     * Handles server config
     * @param guild Guild that the message from sent from
     */
    static async handleServerConfig(guild) {
        // * -------------------- Setup --------------------
        const { id, ownerID, name } = guild;
        // * -------------------- Handle Per Server Configs --------------------
        // Per server config
        if (!guild)
            return config.prefix;
        let db = await database_1.default.models.ServerConfig.findOne({
            where: { id }
        });
        if (!db) {
            Logger_1.Log.info('Config Manager', `Creating new server config for guild ID [ ${guild.id} ] [ ${guild.name} ]`);
            db = await database_1.default.models.ServerConfig.create({
                id,
                ownerID,
                config: JSON.stringify({
                    announcementChannel: null,
                    logChannel: null,
                    prefix: config.prefix,
                    rules: [],
                    modMailChannel: null,
                    starboardChannel: null,
                    welcomeChannel: null,
                    levelUpMessage: 'Welcome to level {level}'
                }),
                memberLevels: JSON.stringify({
                    levelRoles: [],
                    levels: {}
                }),
                messages: JSON.stringify({
                    channels: {},
                    dm: {}
                }),
                serverName: name
            });
        }
        // * just to handle db updates when adding commands
        const conf = JSON.parse(db.get('config'));
        if (!conf.announcementChannel) {
            conf.announcementChannel = null;
            await db.update({
                config: JSON.stringify(conf)
            });
        }
        const prefix = db.get('prefix') || config.prefix;
        return prefix;
    }
    /**
     * Handles member config
     * @param msg Origninal message
     */
    static async handleMemberConfig(msg) {
        // * -------------------- Setup --------------------
        const { author } = msg;
        const { id, tag: username } = author;
        // * -------------------- Setup --------------------
        const db = await database_1.default.models.MemberConfig.findOne({ where: { id } });
        if (!db) {
            Logger_1.Log.info('Config Manager', `Created new member config for user [ ${id} ] [ ${username} ]`);
            await database_1.default.models.MemberConfig.create({
                username,
                id,
                config: JSON.stringify({
                    todos: []
                })
            });
        }
    }
}
exports.ConfigManager = ConfigManager;
