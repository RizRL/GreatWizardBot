// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const love = require("../../modules/love.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */
exports.run = async (client, message) => {
    love.compare(message.author.id)
        ? message.channel.send("<3")
        : message.channel.send("</3");
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "love",
    category: "Fun",
    description: "<3>",
    usage: "love"
};
