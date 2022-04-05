// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const config = require("../../config.js");
const love = require("../../modules/love.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, [action, ...args], level) => {
    const isSub = message.author.permLevel >= client.container.levelCache[config.permNames.SUBSCRIBER];
    love.inc(message.author.id, isSub);
    const value = love.get(message.author.id);
    message.channel.send(`Affection delivered. <3 \`[${value}]\``);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["gib"],
    permLevel: "Subscriber"
};

exports.help = {
    name: "giblove",
    category: "Subs",
    description: "Receive mandatory affection.",
    usage: "giblove"
};
