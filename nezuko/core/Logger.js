const chalk = require('chalk')
const moment = require('moment')
const { format } = require('util')

module.exports = class Logger {
  // Throw error if someone tries to create an instance
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  // Loggerging Time Format
  static time() {
    return moment().format('MM-DD h:mm A')
  }

  // Logger
  static Logger(style, errorType, name, message, stacktrace) {
    const msg = `[${chalk.grey(Logger.time())}] ${style(errorType)}: ${chalk.green(
      name
    )} ${chalk.yellow(message ? `${chalk.white('-')} ${message}` : '')}`

    // Logger Stacktrace
    if (stacktrace) {
      console.log(msg)
      return console.trace(format(message))
    }

    // Logger Normally
    message = typeof message === 'string' ? message.replace(/\r?\n|\r/g, ' ') : message
    return console.log(msg)
  }

  static ok(name, message) {
    return Logger.Logger(chalk.green.bold, 'OK', name, message)
  }

  static error(name, message, stacktrace) {
    return Logger.Logger(chalk.red.bold, 'ERROR', name, message, stacktrace)
  }

  static warn(name, message) {
    return Logger.Logger(chalk.yellow.bold, 'WARN', name, message)
  }

  static info(name, message) {
    return Logger.Logger(chalk.blue.bold, 'INFO', name, message)
  }

  static debug(name, message) {
    return Logger.Logger(chalk.magenta.bold, 'DEBUG', name, message)
  }

  static fatal(message, stacktrace) {
    throw Logger.Logger(chalk.bgRed.white.bold, false, message, stacktrace)
  }
}
