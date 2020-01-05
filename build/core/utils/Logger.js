"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const moment_1 = __importDefault(require("moment"));
class Log {
    // Throw error if someone tries to create an instance
    constructor() {
        throw new Error(`${this.constructor.name} class cannot be instantiated`);
    }
    // Loggerging Time Format
    static time() {
        return moment_1.default().format('MM-DD h:mm A');
    }
    // Logger
    static logger(style, errorType, name, message, stacktrace) {
        const msg = `[${chalk_1.default.grey(Log.time())}] ${style(errorType)}: ${chalk_1.default.green(name)} ${chalk_1.default.yellow(message ? `${chalk_1.default.white('-')} ${message}` : '')}`;
        // Logger Stacktrace
        if (stacktrace) {
            console.log(msg);
            return console.trace(util_1.format(message));
        }
        // Logger Normally
        message = typeof message === 'string' ? message.replace(/\r?\n|\r/g, ' ') : message;
        return console.log(msg);
    }
    static ok(name, message) {
        return Log.logger(chalk_1.default.green.bold, 'OK', name, message);
    }
    static error(name, message, stacktrace = null) {
        return Log.logger(chalk_1.default.red.bold, 'ERROR', name, message, stacktrace);
    }
    static warn(name, message) {
        return Log.logger(chalk_1.default.yellow.bold, 'WARN', name, message);
    }
    static info(name, message) {
        return Log.logger(chalk_1.default.blue.bold, 'INFO', name, message);
    }
    static debug(name, message) {
        return Log.logger(chalk_1.default.magenta.bold, 'DEBUG', name, message);
    }
    static fatal(message, stacktrace) {
        throw Log.logger(chalk_1.default.bgRed.white.bold, false, message, stacktrace);
    }
}
exports.Log = Log;
