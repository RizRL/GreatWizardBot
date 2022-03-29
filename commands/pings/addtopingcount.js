const { pingCounter } = require("../../modules/settings.js");

exports.run = async (client, message, args) => {
    const user = message.mentions.users.first();
    if (!user) {
        return;
    }
    if (isNaN(args[1])) {
        return;
    }

    pingCounter.set(
        user.id,
        Number(pingCounter.ensure(user.id, 0)) + Number(args[1])
    );
    
    message.channel.send(`${user} has pinged me ${pingCounter.get(user.id)} times.`).catch(console.error);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Moderator"
};

exports.help = {
    name: "addtopingcount",
    category: "Fun",
    description: "Numbers go up",
    usage: "addtopingcount [mention] [int]"
};
