"use strict";
/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const sequelize_typescript_1 = require("sequelize-typescript");
exports.database = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    logging: false,
    models: [`${__dirname}/models`],
    storage: path_1.join(`${__dirname}/../../config/db.sqlite`)
});
