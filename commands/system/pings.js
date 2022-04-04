const { pingDisable } = require("../../modules/settings.js");

exports.run = (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
    const setting = pingDisable.ensure(message.author.id, 1);
    if (["y", "ye", "yes", "allow", "on"].includes(action.toLowerCase())) {
        pingDisable.set(message.author.id, 1);
        message.channel.send("I will now sometimes ping you.");
    } else if (["n", "no", "disable", "off"].includes(action.toLowerCase())) {
        pingDisable.set(message.author.id, 0);
        message.channel.send("I will no longer ping you unprovoked. I may still ping you in direct response to you.");
    } else { 
        if (setting == 1) {
            message.channel.send("I couldn't understand your option. You are currently opted IN to extraneous pings.");
        } else {
            message.channel.send("I couldn't understand your option. You are currently opted OUT of extraneous pings.");
        }
    }
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "User"
};

exports.help = {
    name: "pings",
    category: "System",
    description: "Allow or disallow the bot to ping you when unprovoked. Y = allow pings, N = disallow pings.",
    usage: "pings [y|n]"
};
