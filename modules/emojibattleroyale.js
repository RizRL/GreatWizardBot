// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const config = require("../config.js");
const Enmap = require("enmap");
const logger = require("./logger.js");
const love = require("./love.js");
const manager = require("./discord-manager");
const messageUtils = require("./messageUtils.js");
const riz = require("./riz.js");

/**
 * Update the channel topic with relevant data.
 * @param {Discord.TextChannel} channel
 * */
function updateChannel(channel) { 
    // Only update if at last 5 minutes have passed.
    const date = new Date();
    const time = Math.round(+date / 1000);
    const skipUpdate = (time - exports.Enmap.get(channel.id, "lastUpdate")) < (60 * 5);
    if (skipUpdate) { 
        return;
    }

    const level = exports.Enmap.get(channel.id, "level");
    exports.Enmap.set(channel.id, time, "lastUpdate");
    return channel.setTopic(`LEVEL ${level} [${date.toUTCString()}]`);
}

/**
 * Save participation.
 * @param {Discord.Message} message
 * @param {number} dmg
 * */
function recordDamage(message, dmg = 1) {
    const level = exports.Enmap.get(message.channel.id, "level");
    const path = `participants.${level}.${message.author.id}`;
    const userDamage = exports.Enmap.ensure(message.channel.id, 0, path);
    exports.Enmap.set(message.channel.id, userDamage + dmg, path);

    const levelDamage = exports.Enmap.ensure(message.channel.id, 0, "current.damage");
    exports.Enmap.set(message.channel.id, levelDamage + dmg, "current.damage");
    exports.Enmap.push(message.channel.id, `${message.author.id}`, "current.users", false);

    const overallDamage = exports.Enmap.ensure(message.channel.id, 0, "overall.damage");
    exports.Enmap.set(message.channel.id, overallDamage + dmg, "overall.damage");
    exports.Enmap.push(message.channel.id, `${message.author.id}`, "overall.users", false);
}

/**
 * Save participation.
 * @param {Discord.TextChannel} channel
 * @param {Discord.Snowflake} id
 * @param {number} level
 * */
function getUserDamage(channel, id, level = 0) {
    if (!level) { 
        level = exports.Enmap.get(channel.id, "level");
    }
    const path = `participants.${level}.${id}`;
    const userDamage = exports.Enmap.ensure(channel.id, 0, path);
    return userDamage;
}

/**
 * New level new boss.
 * @param {Discord.TextChannel} channel
 * */
async function levelUp(channel) {
    const prevLevel = exports.Enmap.get(channel.id, "level");
    const totalHealth = exports.Enmap.get(channel.id, "health.total");
    const newHealth = totalHealth * 2;

    const levelUsers = exports.Enmap.get(channel.id, "current.users");
    const levelPosts = exports.Enmap.get(channel.id, "current.posts");

    const randomLove = levelUsers[Math.floor(Math.random() * levelUsers.length)];
    const randomLoveMember = await channel.guild.members.fetch(randomLove);
    const userLevelDamage = getUserDamage(channel, randomLove, prevLevel);
    love.give(randomLove, userLevelDamage);

    exports.Enmap.set(
        channel.id,
        {
            users: [],
            posts: 0,
            damage: 0,
        },
        "current"
    );
    exports.Enmap.set(
        channel.id,
        messageUtils.getRandomEmojis(channel.guild, 3, false).map(e => e.identifier),
        "emojis");
    exports.Enmap.set(channel.id, newHealth, "health.total");
    exports.Enmap.set(channel.id, newHealth, "health.current");
    exports.Enmap.inc(channel.id, "level");

    const str = [
        `${messageUtils.getMentionString(randomLoveMember)} wins the lottery and receives mandatory affection. \`[+${userLevelDamage}]\``,
        "",
        `\`NEXT:\` LEVEL ${prevLevel + 1}`,
        `\`PREV:\` ${levelUsers.length} Users | ${levelPosts} Posts`
    ].join("\n");
    channel.send(str);
}

/**
 * Adjust values.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
async function inc(client, message) {
    const damage = 1;
    let mult = 1;
    for (const emoji of exports.Enmap.get(message.channel.id, "emojis")) { 
        if (message.content.includes(`<:${emoji}>`)) {
            mult = 2;
            message.react(riz.Unicode.Lightning);
            break;
        }
    }

    const currentHealth = exports.Enmap.get(message.channel.id, "health.current");
    const damageDealt = Math.min(currentHealth, (damage * mult));
    const newHealth = currentHealth - damageDealt;
    recordDamage(message, damageDealt);

    const isSub = message.author.permLevel >= client.container.levelCache[config.permNames.SUBSCRIBER];
    love.inc(message.author.id, isSub);

    exports.Enmap.inc(message.channel.id, "current.posts");
    exports.Enmap.inc(message.channel.id, "overall.posts");
    exports.Enmap.set(message.channel.id, newHealth, "health.current");

    if (newHealth <= 0) { 
        await levelUp(message.channel);
        updateChannel(message.channel);
    }
}

/**
 * Adjust values.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
function yeet(client, message) { 
    // Yeet the member via role
    const roleID = exports.Enmap.get(message.channel.id, "role");
    message.member.roles.add(roleID).catch(console.error);

    // Yeet by length of 1 minute * unique users * consecutive posts
    // Half time if over average love.
    const time = (+new Date() / 1000);
    const overallUsers = exports.Enmap.get(message.channel.id, "overall.users").length;
    const overallPosts = exports.Enmap.get(message.channel.id, "overall.posts");
    const div = love.compare(message.author.id) ? 2 : 1;
    const yeetedMinutes = Math.round((1 + overallUsers + overallPosts) / div);
    const yeetedSeconds = 60 * yeetedMinutes;
    manager.RoleManager.TimedRoles.Set(message.guild.id, message.member.id, roleID, time + yeetedSeconds);

    const isSub = message.author.permLevel >= client.container.levelCache[config.permNames.SUBSCRIBER];
    love.dec(message.author.id, isSub);

    const str = `
***${riz.Games.GetYeetedString(message.author)} [${yeetedMinutes}m]***

\`LAST:\` ${overallUsers} Users | ${overallPosts} Posts`;
    message.channel.send(str);
}

/**
 * Remove a emoji battle royale channel.
 * TODO: Fix the yeet length
 * @param {Discord.TextChannel} channel
 * @param {Array} args
 * */
function reset(channel) {
    const obj = {
        users: [],
        posts: 0,
        damage: 0,
    };
    exports.Enmap.set(
        channel.id,
        messageUtils.getRandomEmojis(channel.guild, 3, false).map(e => e.identifier),
        "emojis");
    exports.Enmap.set(channel.id, obj, "current");
    exports.Enmap.set(channel.id, obj, "overall");
    exports.Enmap.set(channel.id, {}, "participants");
    exports.Enmap.set(channel.id, 1, "level");
    exports.Enmap.set(channel.id, 2, "health.total");
    exports.Enmap.set(channel.id, 2, "health.current");
}



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
        role: role.id,
        lastUpdate: 0,
    });

    reset(message.channel);
    updateChannel(message.channel);
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
    message.channel.setTopic("");
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

    if (riz.Util.ContainsNonEmojis(message.content)) {
        yeet(client, message);
        reset(message.channel);
    } else { 
        inc(client, message);
    }
};
