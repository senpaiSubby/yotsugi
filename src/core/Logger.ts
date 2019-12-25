/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import chalk from 'chalk'
import { format } from 'util'
import moment from 'moment'

export class Log {
  // Throw error if someone tries to create an instance
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  /**
   * log time formatting
   */
  public static time() {
    return moment().format('MM-DD h:mm A')
  }

  /**
   * log
   * @param style Chalk style to use
   * @param errorType Error type
   * @param name Name of error
   * @param message Message to include
   * @param stacktrace Stacktrace if any?
   */
  public static log(
    style: chalk.Chalk,
    errorType: string | boolean,
    name: unknown,
    message: string,
    stacktrace?: undefined
  ) {
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

  /**
   * Log a Green OK message
   * @param name Name of message
   * @param message Message
   */
  public static ok(name: any, message: any) {
    return Log.log(chalk.green.bold, 'OK', name, message)
  }

  /**
   * Log a Red error message
   * @param name Name of error
   * @param message Message
   * @param stacktrace Stacktrace
   */
  public static error(name: any, message: any, stacktrace?: any) {
    return Log.log(chalk.red.bold, 'ERROR', name, message, stacktrace)
  }

  /**
   * Log a Yellow warning message
   * @param name Name of warning
   * @param message Message
   */
  public static warn(name: any, message: any) {
    return Log.log(chalk.yellow.bold, 'WARN', name, message)
  }

  /**
   * Log a Blue info message
   * @param name Name of info
   * @param message Message
   */
  public static info(name: any, message: any) {
    return Log.log(chalk.blue.bold, 'INFO', name, message)
  }

  /**
   * Log a Magenta debug message
   * @param nameDebug name
   * @param message Message
   */
  public static debug(name: any, message: any) {
    return Log.log(chalk.magenta.bold, 'DEBUG', name, message)
  }

  /**
   * Log a Fatal white message
   * @param message Message
   * @param stacktrace Stacktrace
   */
  public static fatal(message: any, stacktrace: any) {
    throw Log.log(chalk.bgRed.white.bold, false, message, stacktrace)
  }
}
