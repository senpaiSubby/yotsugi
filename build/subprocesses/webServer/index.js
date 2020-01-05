"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Subprocess_1 = require("../../core/Subprocess");
const cors_1 = __importDefault(require("cors"));
const moment_1 = require("moment");
const express_1 = __importDefault(require("express"));
const serve_index_1 = __importDefault(require("serve-index"));
const shortid_1 = __importDefault(require("shortid"));
Promise.resolve().then(() => __importStar(require('moment-duration-format')));
class WebServer extends Subprocess_1.Subprocess {
    constructor(client) {
        super(client, {
            name: 'Web Server',
            description: 'Web Server',
            disabled: false
        });
        this.client = client;
        this.commandManager = client.commandManager;
    }
    async run() {
        shortid_1.default.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-@');
        /**
         * example API usage
         *  {
         *      "command": "<command> <params>"
         *  }
         */
        const { webServerPort, ownerID } = this.client.config;
        const { Log, generalConfig } = this.client;
        const checkApiKey = async (req, res) => {
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            const config = JSON.parse(db.dataValues.config);
            const { apiKey } = config.webUI;
            if (!req.body.apiKey) {
                Log.info('Web Server', `[ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ]sent command [ ${req.body.command} ] without APIKEY`);
                return res.status(401).json({ response: 'Missing params \'apiKey\'' });
            }
            if (req.body.apiKey !== apiKey) {
                Log.info('Web Server', `[ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ] sent BAD APIKEY for command [ ${req.body.command} ]`);
                return res.status(401).json({ response: 'API key is incorrect' });
            }
            return true;
        };
        const app = express_1.default();
        app.use(express_1.default.json());
        app.use(cors_1.default({ credentials: true, origin: ['http://127.0.0.1:3000'] }));
        app.use(express_1.default.static(`${__dirname}/app/build`));
        // Serve out icons folder
        app.use('/icons', express_1.default.static(`${__dirname}/../../data/images/icons`));
        app.use('/icons', serve_index_1.default(`${__dirname}/../../data/images/icons`));
        // Home page
        app.get('/', (req, res) => res.sendFile('/index.html'));
        // Get DB info
        app.get('/api/db/app', async (req, res) => {
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            return res.status(200).json(JSON.parse(db.dataValues.config));
        });
        // Set DB info
        app.post('/api/db/app', async (req, res) => {
            Log.info('Web Server', `DB update from [ ${req.ip} ]`);
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            if (req.body.config) {
                await db.update({ config: JSON.stringify(req.body.config) });
                return res.sendStatus(200);
            }
        });
        // Get DB info
        app.get('/api/db/ui', async (req, res) => {
            Log.info('Web Server', `New connection from [ ${req.ip} ]`);
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            const { webUI } = JSON.parse(db.dataValues.config);
            return res.status(200).json(webUI.commands);
        });
        // Set DB info
        app.post('/api/db/ui', async (req, res) => {
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            const config = JSON.parse(db.dataValues.config);
            const { commands } = config.webUI;
            if (req.body[0] && req.body[1]) {
                commands.push({ id: shortid_1.default.generate(), name: req.body[0], command: req.body[1] });
                await db.update({ config: JSON.stringify(config) });
                return res.status(200);
            }
        });
        // Remove Button
        app.post('/api/db/ui/rm/:id', async (req, res) => {
            const db = await generalConfig.findOne({ where: { id: ownerID } });
            const config = JSON.parse(db.dataValues.config);
            const { commands } = config.webUI;
            const index = commands.findIndex((x) => x.id === req.params.id);
            commands.splice(index, 1);
            await db.update({ config: JSON.stringify(config) });
            return res.status(200);
        });
        // General bot info
        app.get('/api/info', async (req, res) => {
            const { uptime, user, status } = this.client;
            const { username, id, avatar } = user;
            return res.status(200).json({
                username,
                id,
                status,
                avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
                upTime: moment_1.duration(uptime).format('d[d] h[h] m[m] s[s]')
            });
        });
        // Endpoint for running commands
        app.post('/api/commands', async (req, res) => {
            const verified = await checkApiKey(req, res);
            if (typeof verified === 'boolean') {
                Log.info('Web Server', `Running command [ ${req.ip} ]`);
                // Check if all required params are met
                if (!req.body.command)
                    res.status(406).json({ response: 'Missing params \'command\'' });
                const args = req.body.command.split(' ');
                const cmdName = args.shift().toLowerCase();
                const cmd = this.commandManager.findCommand(cmdName);
                if (cmd) {
                    if (cmd.disabled) {
                        return res.status(403).json({ response: 'Command is disabled bot wide.' });
                    }
                    if (!cmd.webUI) {
                        return res.status(403).json({ response: 'Command is disabled for use in the API.' });
                    }
                    const response = await this.commandManager.runCommand(this.client, cmd, null, args, true);
                    return res.status(200).json({ response });
                }
                return res.status(406).json({ response: `Command [ ${req.body.command} ] not found.` });
            }
        });
        // Start server
        app.listen(webServerPort, '0.0.0.0', () => Log.ok(`Web Server`, `Active on port [ ${webServerPort} ]`));
    }
}
exports.default = WebServer;
