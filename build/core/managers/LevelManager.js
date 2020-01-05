"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
const Utils_1 = require("../utils/Utils");
/**
 * Level manager
 * Handles keeping track of user levelign and assigning roles based on levels
 */
class LevelManager {
    constructor(msg) {
        this.msg = msg;
        this.author = msg.author;
        this.guild = msg.guild;
    }
    /**
     * Handle the User level
     */
    async manage() {
        if (this.msg.channel.type === 'text') {
            await this.handleXP();
            await this.handleRole();
        }
    }
    /**
     * Gets Server Config
     * @returns ServerConfig
     */
    async getDB() {
        return await database_1.default.models.ServerConfig.findOne({
            where: { id: this.guild.id }
        });
    }
    /**
     * Gets member level
     * @returns member level
     */
    async getMemberLevel() {
        const db = await this.getDB();
        const memberLevels = JSON.parse(db.get('memberLevels'));
        this.memberLevels = memberLevels;
        if (!memberLevels.levels[this.author.id]) {
            memberLevels.levels[this.author.id] = { level: 1, exp: 0, expTillNextLevel: 100 };
        }
        return memberLevels.levels[this.author.id];
    }
    /**
     * Handles general exp leveling for guild
     */
    async handleXP() {
        const db = await this.getDB();
        const member = await this.getMemberLevel();
        const levelUpMessage = (level) => Utils_1.Utils.standardMessage(this.msg, `You are now level [ ${level} ] :confetti_ball:`);
        if (member.level === 1 && member.exp >= 100) {
            member.level++;
            member.exp = 0;
            await levelUpMessage(member.level);
        }
        else if (member.exp >= 100 * member.level * 2) {
            member.level++;
            member.exp = 0;
            await levelUpMessage(member.level);
        }
        else {
            member.exp++;
        }
        member.expTillNextLevel = 100 * member.level * 2 - member.exp;
        this.level = member.level;
        await db.update({ memberLevels: JSON.stringify(this.memberLevels) });
    }
    /**
     * Handles assigning roles based on user levels
     */
    async handleRole() {
        const db = await database_1.default.models.ServerConfig.findOne({
            where: { id: this.guild.id }
        });
        const memberLevels = JSON.parse(db.get('memberLevels'));
        const { levelRoles } = memberLevels;
        const gMember = this.guild.member(this.author);
        for (const levelInfo of levelRoles) {
            const { role, level } = levelInfo;
            if (this.level === Number(level)) {
                const gRole = this.guild.roles.find((r) => r.name.toLowerCase() === role.toLowerCase());
                if (gRole) {
                    if (this.guild.roles.has(gRole.id)) {
                        if (!gMember.roles.find((r) => r.name === role)) {
                            await gMember.addRole(gRole.id);
                            await Utils_1.Utils.standardMessage(this.msg, `You've been upgraded to the role [ ${role} ]`);
                        }
                    }
                }
            }
        }
    }
}
exports.LevelManager = LevelManager;
