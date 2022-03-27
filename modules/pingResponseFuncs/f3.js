// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const { commandUtils } = require("../settings.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} msg
 * */
module.exports = async (client, msg) => {
    commandUtils.set("f3", Number(commandUtils.ensure("f3", 0) + 1));
    return `${commandUtils.get("f3")}`;
};
