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
        totalContributions: 0,
        role: role.id,

        userYeets: {},

        userContributionsCurrent: {},
        userContributionsTotal: {},

        userCountsCurrent: {},
        userCountsTotal: {},
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
 * Reset a sequence channel.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
exports.reset = async (client, message) => { 

    if (!exports.Enmap.has(message.channel.id)) {
        return;
    }

    const current = exports.Enmap.get(message.channel.id, "current") - 1;
    exports.Enmap.set(message.channel.id, 1, "current");

    const totalContributions = exports.Enmap.ensure(message.channel.id, 0, "totalContributions");
    exports.Enmap.set(message.channel.id, current + totalContributions, "totalContributions");

    const newRecord = current > exports.Enmap.get(message.channel.id, "record");
    if (newRecord) {
        exports.Enmap.set(message.channel.id, current, "record");
    }

    exports.Enmap.set(message.channel.id, {}, "userContributionsCurrent");
    exports.Enmap.set(message.channel.id, {}, "userCountsCurrent");

    exports.Enmap.ensure(message.channel.id, {}, "userYeets");
    exports.Enmap.ensure(message.channel.id, 0, `userYeets.${message.author.id}`);
    exports.Enmap.inc(message.channel.id, `userYeets.${message.author.id}`);
    
};

/**
 * @param {Discord.Message} message 
 * @param {("Current"|"Total")} type 
 */
function saveContribution(message, type) {
    exports.Enmap.ensure(message.channel.id, {}, `userContributions${type}`);
    const path = `userContributions${type}.${message.author.id}`;
    const contribution = exports.Enmap.ensure(message.channel.id, 0, path);
    exports.Enmap.set(message.channel.id, Number(message.content) + contribution, path);
}

/**
 * @param {Discord.Message} message 
 * @param {("Current"|"Total")} type 
 */
function saveCount(message, type = "Current" || "Total") {
    exports.Enmap.ensure(message.channel.id, {}, `userCounts${type}`);
    const path = `userCounts${type}.${message.author.id}`;
    exports.Enmap.ensure(message.channel.id, 0, path);
    exports.Enmap.inc(message.channel.id, path);
}

/**
 * Increment the sequence
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
exports.increment = async (client, message) => {

    exports.Enmap.inc(message.channel.id, "current");

    saveContribution(message, "Current");
    saveContribution(message, "Total");
    saveCount(message, "Current");
    saveCount(message, "Total");

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
        await exports.increment(client, message);
        return;
    }

    // Yeet the member via role
    const roleID = exports.Enmap.get(message.channel.id, "role");
    await message.member.roles.add(roleID).catch(console.error);

    // Yeet by length of (1 minute * sequence length + sequences broken)
    const time = (+new Date() / 1000);
    const yeets = exports.Enmap.get(message.channel.id, `userYeets.${message.author.id}`) || 0;
    const current = exports.Enmap.get(message.channel.id, "current");
    const yeetedLength = time + (Number(yeets) * 60) + (Number(current) * 60);
    const yeetedMinutes = Math.round((yeetedLength - time) / 60);
    manager.RoleManager.TimedRoles.Set(message.guild.id, message.member.id, roleID, yeetedLength);

    // Reset
    exports.reset(client, message);

    // Construct a message and send it.
    const record = exports.Enmap.get(message.channel.id, "record");
    const totalContributions = exports.Enmap.get(message.channel.id, "totalContributions");
    const string = [
        `***${riz.Games.GetYeetedString(message.author)} [${yeetedMinutes}m]***`,
        `\`Peak Sequence: ${record}\``,
        `\`Contributions: ${totalContributions}\``
    ].join("\n");

    message.channel.send(string).catch(console.error);

};
