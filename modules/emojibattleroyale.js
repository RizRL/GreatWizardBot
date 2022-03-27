// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const Enmap = require("enmap");
const logger = require("./logger.js");

const manager = require("./discord-manager");
const riz = require("./riz.js");

exports.Enmap = new Enmap({ name: "emojibattleroyale" });

/**
 * Make sure the Enmap is initialized.
 * @param {Discord.Client} client
 * */
exports.init = async (client) => {
    await exports.Enmap.defer;
    return Promise.resolve(logger.log("Emoji Battle Royale initialized."));
};

/**
 * Add a new emoji battle royale channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * */
exports.add = async (client, message, args) => {

    if (exports.Enmap.has(message.channel.id)) {
        return message.react(riz.Unicode.ThumbsDown);
    }
    const role = message.guild.roles.cache.get(args[0]);
    if (!role) {
        return message.react(riz.Unicode.ThumbsDown);
    }

    exports.Enmap.set(message.channel.id, {
        role: role.id
    });
    return message.react(riz.Unicode.ThumbsUp);

};

/**
 * Remove a emoji battle royale channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * */
exports.remove = async (client, message, args) => { 

    if (!exports.Enmap.has(message.channel.id)) {
        return message.react(riz.Unicode.ThumbsDown);
    }
    exports.Enmap.delete(message.channel.id);
    return message.react(riz.Unicode.ThumbsUp);

};

/**
 * Check an emoji battle royale channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
exports.check = async (client, message) => {

    if (message.author.bot) {
        return;
    }
    if (!exports.Enmap.has(message.channel.id)) {
        return;
    }
    if (!riz.Util.ContainsNonEmojis(message.content)) {
        return;
    }

    const yeetedLength = (+new Date() / 1000) + 60;
    const yeetedMinutes = Math.round((yeetedLength - (+new Date() / 1000)) / 60);

    const roleID = exports.Enmap.get(message.channel.id, "role");
    await message.member.roles.add(roleID).catch(console.error);
    manager.RoleManager.TimedRoles.Set(message.guild.id, message.member.id, roleID, yeetedLength);
    message.channel.send(`***${riz.Games.GetYeetedString(message.author)} [${yeetedMinutes}m]***`).catch(console.error);

};
