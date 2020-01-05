"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const unirest_1 = require("unirest");
const Command_1 = require("../../core/Command");
class Meraki extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: 'meraki',
            category: 'Networking',
            description: 'Meraki network info',
            usage: [`meraki list`],
            webUI: true,
            args: true
        });
    }
    async run(client, msg, args, api) {
        // * ------------------ Setup --------------------
        const { bytesToSize, sortByKey } = client.Utils;
        const { p, Utils, Log } = client;
        const { errorMessage, validOptions, missingConfig, embed, paginate } = Utils;
        // * ------------------ Config --------------------
        const { serielNum, apiKey } = client.db.config.meraki;
        // * ------------------ Check Config --------------------
        if (!serielNum || !apiKey) {
            const settings = [
                `${p}config set meraki serielNum <SERIEL>`,
                `${p}config set meraki apiKey <APIKEY>`
            ];
            return missingConfig(msg, 'meraki', settings);
        }
        // * ------------------ Logic --------------------
        const networkDevices = async () => {
            try {
                // General network devices
                const url = `https://n263.meraki.com/api/v0/devices/${serielNum}/clients?timespan=86400`;
                const response = await unirest_1.get(url).headers({
                    'X-Cisco-Meraki-API-Key': apiKey,
                    accept: 'application/json'
                });
                const devices = response.body;
                let sent = 0; // Total send data counter
                let recv = 0; // Total recv data counter
                if (devices) {
                    // If we have a connection to the meraki API
                    const deviceList = [];
                    devices.forEach((device) => {
                        // Gather / format json for each device in network
                        let description;
                        if (device.description)
                            description = device.description;
                        // If no device description set use hostname instead
                        else
                            description = device.dhcpHostname;
                        // General device info
                        const { ip, vlan, mac } = device;
                        // Convert kb to B and get readable size
                        const uploaded = bytesToSize(device.usage.recv * 1000);
                        const downloaded = bytesToSize(device.usage.sent * 1000);
                        sent += device.usage.recv;
                        recv += device.usage.sent;
                        // New device json
                        deviceList.push({
                            ip,
                            mac,
                            vlan,
                            name: description,
                            sent: uploaded,
                            recv: downloaded
                        });
                    });
                    return {
                        numDevices: deviceList.length,
                        traffic: { sent: bytesToSize(sent * 1000), recv: bytesToSize(recv * 1000) },
                        devices: sortByKey(deviceList, '-ip')
                    };
                }
            }
            catch (e) {
                if (api)
                    return `Failed to connect to Meraki`;
                Log.error('Meraki', 'Failed to connect to Meraki', e);
                await errorMessage(msg, `Failed to connect to Meraki`);
            }
        };
        // * ------------------ Usage Logic --------------------
        switch (args[0]) {
            case 'list': {
                const status = await networkDevices();
                if (status && typeof status !== 'string') {
                    const embedList = [];
                    status.devices.forEach((i) => {
                        embedList.push(embed('green', 'cisco.png')
                            .setTitle('Meraki Devices')
                            .addField('Name', i.name, true)
                            .addField('IP', i.ip, true)
                            .addField('VLAN', i.vlan, true)
                            .addField('MAC', i.mac, true)
                            .addField('Sent', i.sent, true)
                            .addField('Recv', i.recv, true));
                    });
                    return paginate(msg, embedList);
                }
                return;
            }
            default:
                return validOptions(msg, ['list']);
        }
    }
}
exports.default = Meraki;
