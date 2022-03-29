// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");
const { loveFactor } = require("../../modules/settings.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, [action, ...args], level) => {

    loveFactor.ensure(message.author.id, 0);
    loveFactor.inc(message.author.id);
    
    message.channel.send("Affection delivered.");

};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Subscriber"
};

exports.help = {
    name: "loveme",
    category: "Subs",
    description: "Receive mandatory affection.",
    usage: "loveme"
};
