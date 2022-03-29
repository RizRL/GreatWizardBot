// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const Enmap = require("enmap");
const logger = require("./logger.js");

const manager = require("./discord-manager");
const riz = require("./riz.js");

exports.Enmap = new Enmap({ name: "sequence" });

/**
 * Make sure the Enmap is initialized.
 * @param {Discord.Client} client
 * */
exports.init = async (client) => { 
    await exports.Enmap.defer;
    return Promise.resolve(logger.log("Sequence initialized."));
};

/**
 * Add a new sequence channel.
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
        current: 1,
        record: 0,
        role: role.id
    });
    return message.react(riz.Unicode.ThumbsUp);

}; 


/**
 * Remove a sequence channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
exports.remove = async (client, message, args) => {

    if (!exports.Enmap.has(message.channel.id)) {
        return message.react(riz.Unicode.ThumbsDown);
    }
    exports.Enmap.delete(message.channel.id);
    return message.react(riz.Unicode.ThumbsUp);

};

/**
 * Remove a sequence channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
exports.reset = async (client, message) => { 

    if (!exports.Enmap.has(message.channel.id)) {
        return;
    }

    const current = exports.Enmap.get(message.channel.id, "current") - 1;
    const newRecord = current > exports.Enmap.get(message.channel.id, "record");
    if (newRecord) {
        exports.Enmap.set(message.channel.id, current, "record");
    }
    exports.Enmap.set(message.channel.id, 1, "current");
    
};

/**
 * Check a sequence channel.
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
    if (message.content == exports.Enmap.get(message.channel.id, "current")) {
        exports.Enmap.inc(message.channel.id, "current");
        return;
    }

    const current = exports.Enmap.get(message.channel.id, "current");
    const yeetedLength = (+new Date() / 1000) + (Number(current) * 60);
    const yeetedMinutes = Math.round((yeetedLength - (+new Date() / 1000)) / 60);

    exports.reset(client, message);
    const record = exports.Enmap.get(message.channel.id, "record");
    const roleID = exports.Enmap.get(message.channel.id, "role");
    const string = [`***${riz.Games.GetYeetedString(message.author)} [${yeetedMinutes}m]***`, `\`Current channel record: ${record}\``].join("\n");
    await message.member.roles.add(roleID).catch(console.error);
    manager.RoleManager.TimedRoles.Set(message.guild.id, message.member.id, roleID, yeetedLength);
    message.channel.send(string).catch(console.error);

};
