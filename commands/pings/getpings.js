// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const { pingResponses } = require("../../modules/settings.js");

const messageUtils = require("../../modules/messageUtils.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */
exports.run = async (client, message) => {
    let response = "__Current Ping Resonses__\n\n";
    const keyArray = pingResponses.keyArray();
    keyArray.sort((a, b) => {
        return Number(a) - Number(b); 
    });
    keyArray.map((e) => {
        response += `\`[${e}]\` ${pingResponses.get(e)}\n`;
    });

    messageUtils.sendLargeMessage(message.channel, response);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Moderator"
};

exports.help = {
    name: "getpings",
    category: "Fun",
    description: "*snoop snoop*",
    usage: "getpings"
};
