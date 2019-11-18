const chalk = require('chalk')
const moment = require('moment')
const { format } = require('util')
const { dirname } = require('path')
const { existsSync, mkdirSync, appendFile } = require('fs')

class Log {
  // Throw error if someone tries to create an instance
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  // Logging Time Format
  static time() {
    return moment().format('MM-DD | h:mm:ss A')
  }

  // Log
  static log(style, name, message, stacktrace) {
    const msg = `[${chalk.grey(Log.time())}] ${style(name)}: ${chalk.white(message)}`

    // Log Stacktrace
    if (stacktrace) {
      console.log(msg)
      return console.trace(format(message))
    }

    // Log Normally
    message = typeof message === 'string' ? message.replace(/\r?\n|\r/g, ' ') : message
    return console.log(msg)
  }

  static success(message) {
    return Log.log(chalk.green.bold, 'SUCCESS', message)
  }

  static error(message, stacktrace) {
    return Log.log(chalk.red.bold, 'ERROR', message, stacktrace)
  }

  static warn(message) {
    return Log.log(chalk.yellow.bold, 'WARN', message)
  }

  static info(message) {
    return Log.log(chalk.blue.bold, 'INFO', message)
  }

  static debug(message) {
    return Log.log(chalk.magenta.bold, 'DEBUG', message)
  }

  static fatal(message, stacktrace) {
    throw Log.log(chalk.bgRed.white.bold, message, stacktrace)
  }
}

module.exports = Log
