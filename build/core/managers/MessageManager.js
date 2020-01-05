"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = require("path");
const torrent2magnet_1 = __importDefault(require("torrent2magnet"));
class MessageManager {
    constructor(client) {
        this.client = client;
    }
    /**
     * Logs message and attachments if any
     * @param msg NezukoMessage
     */
    async log(msg) {
        const { content, guild, author, channel, createdAt, context, attachments } = msg;
        const { id, tag, username } = author;
        const { serverConfig, Log, config } = this.client;
        const { ownerID } = config;
        const runCommand = async (cmdString) => {
            const commandName = cmdString.split(' ').shift();
            const cmd = context.findCommand(commandName);
            const args = cmdString.split(' ').slice(1);
            if (cmd)
                return context.runCommand(this.client, cmd, msg, args);
        };
        const attachmentParser = async (url) => {
            const fileName = url.split('/').pop();
            const extension = fileName.split('.').pop();
            let cmd = null;
            if (extension === 'torrent') {
                cmd = `tor add ${await torrent2magnet_1.default(url)}`;
            }
            if (cmd)
                return runCommand(cmd);
        };
        const attachmentHandler = async () => {
            // Check if msg contains attachments
            if (attachments) {
                attachments.forEach(async (a) => {
                    const { url } = a;
                    await attachmentParser(url);
                    try {
                        const name = url.split('/').pop();
                        const dir = `${__dirname}/../../Loggers/attachments/${guild.id}/${name}`;
                        // Check if dir exists and create if not
                        if (!fs_1.existsSync(path_1.dirname(dir)))
                            fs_1.mkdirSync(path_1.dirname(dir), { recursive: true });
                        const res = await node_fetch_1.default(url);
                        const fileStream = fs_1.createWriteStream(dir);
                        await new Promise((resolve, reject) => {
                            res.body.pipe(fileStream);
                            res.body.on('error', (err) => reject(err));
                            fileStream.on('finish', () => resolve());
                        });
                    }
                    catch (error) {
                        Log.warn('Attachment Handler', `Failed to handle attachment`);
                    }
                });
            }
        };
        // Forward all messages to our attachment parser
        await attachmentHandler();
        // Log every msg inside of guilds
        if (channel.type === 'text') {
            const db = await serverConfig.findOne({ where: { id: guild.id } });
            const messages = JSON.parse(db.dataValues.messages);
            if (!messages.channels[channel.id])
                messages.channels[channel.id] = [];
            messages.channels[channel.id].push({ id, createdAt, content, username: tag });
            await db.update({ messages: JSON.stringify(messages) });
        }
        // Log every msg inside of DM's
        if (msg.channel.type === 'dm') {
            if (id === ownerID)
                return;
            const db = await serverConfig.findOne({ where: { ownerID } });
            const messages = JSON.parse(db.dataValues.messages);
            if (!messages.dm[id])
                messages.dm[id] = [];
            messages.dm[id].push({ username, id, createdAt, content });
            await db.update({ messages: JSON.stringify(messages) });
        }
    }
}
exports.MessageManager = MessageManager;
