// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} msg
 * */
module.exports = async (client, msg) => {
    return `${msg.author}`;
};
