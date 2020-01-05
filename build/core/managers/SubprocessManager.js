"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importStar(require("path"));
const enmap_1 = __importDefault(require("enmap"));
const NezukoClient_1 = require("../../NezukoClient");
const fs_1 = __importDefault(require("fs"));
// tslint:disable: completed-docs
class SubprocessManager {
    constructor(client) {
        this.client = client;
        this.processes = new enmap_1.default();
        if (!this.client || !(this.client instanceof NezukoClient_1.NezukoClient)) {
            throw new Error('Discord Client is required');
        }
    }
    async loadModules(dir = path_1.join(__dirname, '..', '..', 'subprocesses')) {
        const subprocesses = fs_1.default.readdirSync(dir);
        for (const item of subprocesses) {
            const location = path_1.default.join(dir, item, 'index.js');
            if (!fs_1.default.existsSync(location))
                return;
            // tslint:disable-next-line:variable-name
            const Process = require(location).default;
            const instance = new Process(this.client);
            instance.location = location;
            if (!instance.disabled) {
                if (this.processes.has(instance.name)) {
                    throw new Error('Subprocesses cannot have the same name');
                }
                this.processes.set(instance.name, instance);
            }
        }
        for (const subprocess of this.processes.values()) {
            this.startModule(subprocess);
        }
    }
    startModule(subprocess) {
        try {
            subprocess.run();
            this.client.Log.ok('Subprocess Manager', `Loaded [ ${subprocess.name} ]`);
        }
        catch (err) {
            this.client.Log.warn('Subprocess', err);
        }
    }
}
exports.SubprocessManager = SubprocessManager;
