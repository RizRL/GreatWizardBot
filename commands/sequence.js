// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const sequence = require("../modules/sequence.js");

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
            sequence.add(client, message, args);
            break;

        case "remove":
            sequence.remove(client, message, args);
            break;

        default:
            break;
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Bot Admin"
};

exports.help = {
    name: "sequence",
    category: "Fun",
    description: "Create or remove Sequence channel games.",
    usage: "sequence <args>"
};
