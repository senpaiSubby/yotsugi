"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const bluebird_1 = require("bluebird");
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const Logger_1 = require("./Logger");
class Utils {
    constructor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }
    static checkPerms(user, permsNeeded) {
        const missingPerms = [];
        permsNeeded.forEach((perm) => {
            if (!user.permissions.has(perm))
                missingPerms.push(perm);
        });
        if (missingPerms.length)
            return missingPerms;
    }
    static execAsync(cmd, opts = {}) {
        return new bluebird_1.Promise((resolve) => {
            shelljs_1.default.exec(cmd, opts, (code, stdout, stderr) => resolve({ code, stdout, stderr }));
        });
    }
    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
    // Make embed fields always fit within limits after spliiting
    static arraySplitter(array) {
        // Initial page size
        let pageSize = 40;
        // Split array into multiple even arrays
        let splitArray = Utils.chunkArray(array, pageSize);
        // Dynamically adjust page size based on length of each array
        let willFit = false;
        while (!willFit) {
            let sizeInRange = true;
            // Eslint-disable-next-line no-loop-func
            splitArray.forEach((i) => {
                if (i.join().length > 1024)
                    sizeInRange = false;
            });
            if (sizeInRange)
                willFit = true;
            pageSize--;
            splitArray = Utils.chunkArray(array, pageSize);
        }
        return splitArray;
    }
    /**
     * Paginates RichEmbeds
     * @param msg Original message
     * @param embedList RichEmbed list
     * @param [acceptButton] Show accept button?
     */
    static async paginate(msg, embedList, acceptButton) {
        const { author } = msg;
        let page = 1;
        let run = true;
        const totalPages = embedList.length;
        // Run our loop to wait for user input
        const paginated = (await msg.channel.send('|'));
        while (run) {
            const index = page - 1;
            await paginated.edit(embedList[index].setFooter(`Page ${page}/${totalPages}`));
            if (totalPages !== 1) {
                if (page === 1) {
                    await paginated.react('⏭️');
                    await paginated.react('➡️');
                    if (acceptButton)
                        await paginated.react('✅');
                    // Await paginated.react('🛑')
                }
                else if (page === totalPages) {
                    await paginated.react('⬅️');
                    await paginated.react('⏮️');
                    if (acceptButton)
                        await paginated.react('✅');
                    // Await paginated.react('🛑')
                }
                else {
                    await paginated.react('⏮️');
                    await paginated.react('⬅️');
                    await paginated.react('➡️');
                    await paginated.react('⏭️');
                    if (acceptButton)
                        paginated.react('✅');
                    // Await paginated.react('🛑')
                }
            }
            const collected = await paginated.awaitReactions(
            // tslint:disable-next-line: no-shadowed-variable
            (reaction, user) => ['⬅️', '➡️', '✅', '⏭️', '⏮️', '🛑'].includes(reaction.emoji.name) &&
                user.id === author.id, { max: 1, time: 3600000 });
            const reaction = collected.first();
            if (reaction) {
                switch (reaction.emoji.name) {
                    case '⬅️':
                        page--;
                        break;
                    case '⏮️':
                        page = 1;
                        break;
                    case '➡️':
                        page++;
                        break;
                    case '⏭️':
                        page = totalPages;
                        break;
                    case '✅':
                        run = false;
                        await paginated.clearReactions();
                        return index;
                    case '🛑': {
                        run = false;
                        const m = (await msg.channel.send(Utils.embed('green').setDescription('Canceling..')));
                        await m.delete(2000);
                        await paginated.clearReactions();
                        break;
                    }
                }
            }
            else {
                run = false;
                await paginated.clearReactions();
            }
            await paginated.clearReactions();
        }
    }
    /**
     * Split array into equal chuncks
     * @param myArray Array to split
     * @param chunkSize size of each split
     * @returns
     */
    static chunkArray(myArray, chunkSize) {
        let index = 0;
        const arrayLength = myArray.length;
        const tempArray = [];
        let myChunk;
        for (index = 0; index < arrayLength; index += chunkSize) {
            myChunk = myArray.slice(index, index + chunkSize);
            tempArray.push(myChunk);
        }
        return tempArray;
    }
    static findNested(dir, pattern) {
        let results = [];
        fs_1.default.readdirSync(dir).forEach((innerDir) => {
            innerDir = path_1.default.resolve(dir, innerDir);
            const stat = fs_1.default.statSync(innerDir);
            if (stat.isDirectory())
                results = results.concat(this.findNested(innerDir, pattern));
            if (stat.isFile() && innerDir.endsWith(pattern))
                results.push(innerDir);
        });
        return results;
    }
    static addSpace(count) {
        return '\ufeff '.repeat(count);
    }
    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    static sortByKey(array, key) {
        let sortOrder;
        if (key[0] === '-') {
            sortOrder = -1;
            key = key.substr(1);
        }
        if (sortOrder === -1) {
            return array.sort((a, b) => {
                const x = a[key];
                const y = b[key];
                return x < y ? -1 : x > y ? 1 : 0;
            });
        }
        return array.sort((a, b) => {
            const x = b[key];
            const y = a[key];
            return x < y ? -1 : x > y ? 1 : 0;
        });
    }
    // Sorts an array into multiple arrays based off propery
    static groupBy(array, property) {
        const hash = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < array.length; i++) {
            if (!hash[array[i][property]])
                hash[array[i][property]] = [];
            hash[array[i][property]].push(array[i]);
        }
        return hash;
    }
    static makeShellSafe(text) {
        return text
            .replace(/ /g, '\\ ')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]');
    }
    static bytesToSize(bytes, decimals = 1) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        // Eslint-disable-next-line no-restricted-properties
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }
    static millisecondsToTime(ms) {
        const duration = moment_1.default.duration(ms);
        if (duration.asHours() > 1) {
            return Math.floor(duration.asHours()) + moment_1.default.utc(duration.asMilliseconds()).format(':mm:ss');
        }
        return moment_1.default.utc(duration.asMilliseconds()).format('mm:ss');
    }
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // Global Error Function
    static error(name, message, channel) {
        const embed = new discord_js_1.RichEmbed()
            .setColor('#cc241d')
            .addField('Module', name, true)
            .addField('Time', new Date(), true)
            .addField('Message', message);
        channel = channel || null;
        Logger_1.Log.warn(name, message);
        if (channel)
            channel.send({ embed });
        return false;
    }
    // Global embed template
    static embed(color = 'green', image) {
        const colors = {
            red: '#fb4934',
            green: '#8ec07c',
            blue: '#83a598',
            yellow: '#fabd2f',
            orange: '#d79921',
            white: '#ebdbb2',
            black: '#282828',
            grey: '#928374'
        };
        const e = new discord_js_1.RichEmbed().setColor(colors[color] ? colors[color] : color);
        if (image) {
            // E.attachFile(join(`${__dirname}`, '../', `/core/images/icons/${image}`))
            // E.setThumbnail(`attachment://${image}`)
            e.setThumbnail(`https://raw.githubusercontent.com/callmekory/nezuko/master/nezuko/core/images/icons/${image}`);
        }
        return e;
    }
    static missingConfig(msg, name, params) {
        return msg.channel.send(Utils.embed('red', 'settings.png')
            .setTitle(`Missing [ ${name} ] config!`)
            .setDescription(`\`${msg.p}config get ${name}\` for current config.

          Set them like so..

          \`\`\`css\n${params.join('\n')}\n\`\`\``));
    }
    static errorMessage(msg, text) {
        return msg.channel.send(Utils.embed('red').setDescription(`:rotating_light: **${text}**`));
    }
    static warningMessage(msg, text) {
        return msg.channel.send(Utils.embed('yellow').setDescription(`:warning: **${text}**`));
    }
    static standardMessage(msg, text) {
        return msg.channel.send(Utils.embed('green').setDescription(`**${text}**`));
    }
    // Standard valid options return
    static async validOptions(msg, options) {
        const m = (await msg.channel.send(Utils.embed('yellow', 'question.png').setDescription(`:grey_question: **Valid options are:\n\n- ${options.join('\n- ')}**`)));
        return m.delete(20000);
    }
}
exports.Utils = Utils;
