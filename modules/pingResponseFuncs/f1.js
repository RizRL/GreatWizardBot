// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const { pingCounter } = require("../settings.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} msg
 * */
module.exports = async (client, msg) => {
    const count = pingCounter.ensure(msg.author.id, 1);
    return `You've pinged me ${count} times.`;
};
