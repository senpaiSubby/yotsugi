const chalk = require('chalk')
const moment = require('moment')
const { format } = require('util')

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
  static log(style, errorType, name, message, stacktrace) {
    const msg = `[${chalk.grey(Log.time())}] ${style(errorType)}: ${chalk.green(
      name
    )} ${chalk.yellow(message ? `${chalk.white('-')} ${message}` : '')}`

    // Log Stacktrace
    if (stacktrace) {
      console.log(msg)
      return console.trace(format(message))
    }

    // Log Normally
    message = typeof message === 'string' ? message.replace(/\r?\n|\r/g, ' ') : message
    return console.log(msg)
  }

  static success(name, message) {
    return Log.log(chalk.green.bold, 'SUCCESS', name, message)
  }

  static error(name, message, stacktrace) {
    return Log.log(chalk.red.bold, 'ERROR', name, message, stacktrace)
  }

  static warn(name, message) {
    return Log.log(chalk.yellow.bold, 'WARN', name, message)
  }

  static info(name, message) {
    return Log.log(chalk.blue.bold, 'INFO', name, message)
  }

  static debug(name, message) {
    return Log.log(chalk.magenta.bold, 'DEBUG', name, message)
  }

  static fatal(message, stacktrace) {
    throw Log.log(chalk.bgRed.white.bold, false, message, stacktrace)
  }
}

module.exports = Log
