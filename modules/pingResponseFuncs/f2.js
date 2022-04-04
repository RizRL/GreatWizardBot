// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const love = require("../love.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} msg
 * */
module.exports = async (client, msg) => {
    const arr = love.compare(msg.author.id)
        ? ["It's super effective!"]
        : ["", "It's not very effective...", "But, it failed!"];

    const r1 = `${client.users.cache.get(msg.author.id)} used \`Ping GreatWizardBot\`.`;
    const r2 = arr[Math.floor(Math.random() * arr.length)];
    return [r1, r2].join("\n");
};
