"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../core/Command");
class ArchiveBox extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'archive',
            category: 'Download',
            description: 'Archive web pages via ArchiveBox',
            usage: ['a <url to archive>'],
            aliases: ['a'],
            args: true,
            webUI: false
        });
    }
    async run(client, msg, args) {
        // * ------------------ Setup --------------------
        const { Utils, db } = client;
        const { standardMessage, errorMessage, execAsync, embed, missingConfig } = Utils;
        const { channel } = msg;
        // * ------------------ Config --------------------
        const { path } = db.config.archivebox;
        // If archivebox path is not set
        if (!path) {
            return missingConfig(msg, 'ArchiveBox', ['config set archivebox path <path to archivebox>']);
        }
        // * ------------------ Logic --------------------
        // Let the user know the archiving is beginning
        await channel.send(embed('green', 'archivebox.png').setDescription(`**:printer: Archiving the url

    - ${args[0]}

    :hourglass: This may take some time...**`));
        // Attempt to archive the url
        const { code } = (await execAsync(`cd ${path} && echo "${args[0]}" | ./archive`, {
            silent: true
        }));
        // If exit code isnt 0 then the archive failed
        if (code !== 0)
            return errorMessage(msg, `Failed to archive [ ${args[0]} ]`);
        // Notify that archive is complete
        return standardMessage(msg, `Archive of [ ${args[0]} ] complete!
      You can find it [here](https://atriox.io)`);
    }
}
exports.default = ArchiveBox;
