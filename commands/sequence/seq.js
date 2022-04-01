// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const sequence = require("../../modules/sequence.js");
const messageUtils = require("../../modules/messageUtils.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Number} level
 */
exports.run = async (client, message, args, level) => {

    // Maybe a server has multiple sequence channels.
    const channels = [];
    message.guild.channels.cache.forEach((value, key) => {
        if (sequence.Enmap.has(key)) { 
            channels.push(key);
        }
    });

    // Or not.
    if (!channels.length) { 
        return message.channel.send("This server has no Sequence channels. :(");
    }

    // Ping the author
    const responses = [];
    
    // Each channel has its response divided by single line-breaks
    channels.forEach((channelId) => { 

        const currentContribution = sequence.Enmap.get(channelId, `userContributionsCurrent.${message.author.id}`);
        const currentCount = sequence.Enmap.get(channelId, `userCountsCurrent.${message.author.id}`);
        let currentStr = "You haven't contributed to the current Sequence.";
        if (currentContribution && currentCount) {
            currentStr = `In the current Sequence, you've contributed \`${currentCount}\` times, for a total of \`${currentContribution}\`.`;
        }

        const totalContribution = sequence.Enmap.get(channelId, `userContributionsTotal.${message.author.id}`);
        const totalCount = sequence.Enmap.get(channelId, `userCountsTotal.${message.author.id}`);
        let totalStr = "You haven't contributed to this channel.";
        if (totalContribution && totalCount) {
            totalStr = `Overall, you've contributed \`${totalCount}\` times, for a grand total of \`${totalContribution}\`.`;
        }

        const yeets = sequence.Enmap.get(channelId, `userYeets.${message.author.id}`);
        const yeetsStr = `You have broken \`${yeets || 0}\` Sequences.`;

        responses.push(`${[`<#${channelId}>`, currentStr, totalStr, yeetsStr].join("\n")}`);
        
    });

    // Each entry is divided by double line-breaks.
    messageUtils.sendLargeMessage(message, responses.join("\n\n"));
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["s"],
    permLevel: "User"
};

exports.help = {
    name: "seq",
    category: "Fun",
    description: "Check your contributions to Sequence.",
    usage: "seq"
};
