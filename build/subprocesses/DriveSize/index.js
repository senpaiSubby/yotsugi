"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Subprocess_1 = require("../../core/Subprocess");
const perf_hooks_1 = require("perf_hooks");
class DriveSize extends Subprocess_1.Subprocess {
    constructor(client) {
        super(client, {
            name: 'Drive Size',
            description: 'Updates channel names with info on google drive',
            disabled: false
        });
        this.client = client;
    }
    async run() {
        const { Log, channels, Utils } = this.client;
        const { execAsync } = Utils;
        let start = 0;
        const checkNewStats = async () => {
            if (start === 1)
                Log.info('Drive Stats', 'Started Update');
            const startTime = perf_hooks_1.performance.now();
            const { code, stdout } = (await execAsync(`rclone size --json goog:/`, {
                silent: true
            }));
            const stopTime = perf_hooks_1.performance.now();
            // 3 doesnt exist 0 good
            if (code === 0) {
                const response = JSON.parse(stdout);
                const { count } = response;
                const size = Utils.bytesToSize(response.bytes);
                const fileCountChannel = channels.get('646309179354513420');
                await fileCountChannel.setName(`📰\u2009\u2009\u2009ғiles\u2009\u2009\u2009${count}`);
                const driveSizeChannel = channels.get('646309200686874643');
                await driveSizeChannel.setName(`📁\u2009\u2009\u2009size\u2009\u2009\u2009${size
                    .replace('.', '_')
                    .replace(' ', '\u2009\u2009\u2009')}`);
                return Log.info('Drive Stats', `Updated Rclone stats in ${Utils.millisecondsToTime(stopTime - startTime)}`);
            }
            return Log.warn('Drive Stats', `Failed to update Rclone stats`);
        };
        await checkNewStats();
        start = 1;
        setInterval(checkNewStats, 14400000);
    }
}
exports.default = DriveSize;
