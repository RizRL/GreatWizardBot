// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const ebr = require("../../modules/emojibattleroyale.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, [action, ...args], level) => {
    if (!action) {
        return; 
    }

    switch (action.toLowerCase()) {
        case "add":
            ebr.add(client, message, args);
            break;

        case "remove":
            ebr.remove(client, message, args);
            break;

        default:
            break;
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Administrator"
};

exports.help = {
    name: "ebr",
    category: "Fun",
    description: "Add and remove Emoji Battle Royale channels.",
    usage: "ebr <action, ...args>"
};
