// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const love = require("../../modules/love.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, [id, loveNum, ...args], level) => {

    const member = await message.guild.members.fetch(id);
    if (!member) { 
        message.channel.send(`Member by id ${id} not found.`);
        return;
    }

    if (isNaN(Number(loveNum))) { 
        message.channel.send(`${loveNum} is not convertable to love.`);
        return;
    }

    love.set(member.id, Number(loveNum));
    message.channel.send(`${member} is now loved to a degree of ${loveNum}.`);

};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [""],
    permLevel: "Moderator"
};

exports.help = {
    name: "setlove",
    category: "Fun",
    description: "Set love for a user.",
    usage: "setlove"
};
