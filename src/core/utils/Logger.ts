/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import chalk from 'chalk'
import { format } from 'util'
import moment from 'moment'

export class Log {
  // Throw error if someone tries to create an instance
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  // Loggerging Time Format
  public static time() {
    return moment().format('MM-DD h:mm A')
  }

  // Logger
  public static logger(style, errorType, name, message, stacktrace?) {
    const msg = `[${chalk.grey(Log.time())}] ${style(errorType)}: ${chalk.green(
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

  public static ok(name, message) {
    return Log.logger(chalk.green.bold, 'OK', name, message)
  }

  public static error(name, message, stacktrace = null) {
    return Log.logger(chalk.red.bold, 'ERROR', name, message, stacktrace)
  }

  public static warn(name, message) {
    return Log.logger(chalk.yellow.bold, 'WARN', name, message)
  }

  public static info(name, message) {
    return Log.logger(chalk.blue.bold, 'INFO', name, message)
  }

  public static debug(name, message) {
    return Log.logger(chalk.magenta.bold, 'DEBUG', name, message)
  }

  public static fatal(message, stacktrace) {
    throw Log.logger(chalk.bgRed.white.bold, false, message, stacktrace)
  }
}
