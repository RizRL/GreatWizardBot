// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const { loveFactor } = require("../settings.js");

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} msg
 * */
module.exports = async (client, msg) => {
    const thisLove = loveFactor.ensure(msg.author.id, 0);
    let yes = 0;
    let no = 0;
    loveFactor.every((cur) => {
        thisLove >= cur ? yes++ : no++;
    });

    const r1 = `${client.users.cache.get(msg.author.id)} used \`Ping GreatWizardBot\`.`;
    const arr = yes > no
        ? ["", "It's super effective!"]
        : ["It's not very effective...", "But, it failed!"];
    const r2 = arr[Math.floor(Math.random() * arr.length)];
    
    return [r1, r2].join("\n");
};
