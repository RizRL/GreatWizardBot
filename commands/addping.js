const { pingResponses } = require("../modules/settings.js");

exports.run = async (client, message, args) => {
    const response = pingResponses.set(pingResponses.autonum, args.join(" "));
    response ? message.react("✅").catch(console.error) : message.react("❌").catch(console.error);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Bot Support"
};

exports.help = {
    name: "addping",
    category: "Sass",
    description: "*snap snap*",
    usage: "addping [response]"
};
