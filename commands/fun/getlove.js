// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");
const love = require("../../modules/love.js");
const messageUtils = require("../../modules/messageUtils.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, [action, ...args], level) => {

    const loveArr = [];
    love.Enmap.keyArray().map((e) => {
        loveArr.push([love.get(e), `<@${e}>`]);
    });
    loveArr.sort((a, b) => a[0] > b[0] ? -1 : 1);

    const response = `__Current Love Levels__\n${loveArr.join("\n")}`;
    messageUtils.sendLargeMessage(message.channel, response);
    
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [""],
    permLevel: "Moderator"
};

exports.help = {
    name: "getlove",
    category: "Fun",
    description: "Check love for all users.",
    usage: "getlove"
};
