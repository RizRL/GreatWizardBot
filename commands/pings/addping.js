const { pingResponses } = require("../../modules/settings.js");

exports.run = async (client, message, args) => {
    const response = pingResponses.set(pingResponses.autonum, args.join(" "));
    response ? message.react("✅").catch(console.error) : message.react("❌").catch(console.error);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Moderator"
};

exports.help = {
    name: "addping",
    category: "Fun",
    description: "*snap snap*",
    usage: "addping [response]"
};
