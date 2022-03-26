const { pingCounter } = require("../modules/settings.js");

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first();
    if (!user) {
        return;
    }

    message.channel.send(`${user} has pinged me ${pingCounter.ensure(user.id, 0)} times.`).catch(console.error);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Bot Support"
};

exports.help = {
    name: "getpingcount",
    category: "System",
    description: "Numbers go up",
    usage: "getpingcount [mention]"
};
