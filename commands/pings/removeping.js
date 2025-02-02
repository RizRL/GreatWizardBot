const { pingResponses } = require("../../modules/settings.js");

exports.run = async (client, message, args) => {
    const ping = pingResponses.get(args[0]);
    if (!ping) {
        return message.react("❌").catch(console.error);
    }
    
    pingResponses.delete(args[0]);
    message.react("✅").catch(console.error);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Moderator"
};

exports.help = {
    name: "removeping",
    category: "Fun",
    description: "*snip snip*",
    usage: "removeping [id]"
};
