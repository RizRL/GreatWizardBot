const messageUtils = require("../modules/messageUtils.js");
const { pingResponses } = require("../modules/settings.js");

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
    permLevel: "Bot Support"
};

exports.help = {
    name: "getpings",
    category: "Sass",
    description: "*snoop snoop*",
    usage: "getpings"
};
