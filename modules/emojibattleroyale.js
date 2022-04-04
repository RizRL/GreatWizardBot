// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const Enmap = require("enmap");
const logger = require("./logger.js");

const love = require("./love.js");
const manager = require("./discord-manager");
const riz = require("./riz.js");

/**
 * Determine new SE emojis.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
function getSuperEmojis(client, message) { 
    const emojis = [];
    const cache = message.guild.emojis.cache.filter(e => !e.deleted && !e.animated && e.available);
    while (emojis.length < Math.min(3, cache.size)) { 
        const newEmoji = cache.random();
        if (emojis.filter(e => e.id == newEmoji.id)) { 
            emojis.push(newEmoji.identifier);
        }
    }
    return emojis;
}

/**
 * Update the channel topic with relevant data.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
function updateChannel(client, message) { 
    // Only update if at last 5 minutes have passed.
    const date = new Date();
    const time = Math.round(+date / 1000);
    const skipUpdate = (time - exports.Enmap.get(message.channel.id, "lastUpdate")) < (60 * 5);
    if (skipUpdate) { 
        return;
    }

    const level = exports.Enmap.get(message.channel.id, "level");
    const currentHealth = exports.Enmap.get(message.channel.id, "health.current");
    const totalHealth = exports.Enmap.get(message.channel.id, "health.total");
    exports.Enmap.set(message.channel.id, time, "lastUpdate");
    return message.channel.setTopic(
        `LEVEL ${level} - HP: ${currentHealth} / ${totalHealth} [${date.toUTCString()}]`
    );
}

/**
 * Save participation.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {number} dmg
 * */
function recordDamage(client, message, dmg = 1) {
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
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {number} level
 * */
function getUserDamage(message, id, level = 0) {
    if (!level) { 
        level = exports.Enmap.get(message.channel.id, "level");
    }
    const path = `participants.${level}.${id}`;
    const userDamage = exports.Enmap.ensure(message.channel.id, 0, path);
    return userDamage;
}

/**
 * New level new boss.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
function levelUp(client, message) {
    const prevLevel = exports.Enmap.get(message.channel.id, "level");
    const totalHealth = exports.Enmap.get(message.channel.id, "health.total");
    const newHealth = totalHealth * 2;

    const levelUsers = exports.Enmap.get(message.channel.id, "current.users");
    const levelPosts = exports.Enmap.get(message.channel.id, "current.posts");

    const randomLove = levelUsers[Math.floor(Math.random() * levelUsers.length)];
    const userDamage = getUserDamage(message, randomLove, prevLevel);
    love.give(randomLove, userDamage);

    exports.Enmap.set(
        message.channel.id,
        {
            users: [],
            posts: 0,
            damage: 0,
        },
        "current"
    );
    exports.Enmap.set(message.channel.id, newHealth, "health.total");
    exports.Enmap.set(message.channel.id, newHealth, "health.current");
    exports.Enmap.set(message.channel.id, getSuperEmojis(client, message), "emojis");
    exports.Enmap.inc(message.channel.id, "level");

    message.channel.send(`LEVEL ${prevLevel + 1} \`[${levelUsers.length} | ${levelPosts}]\`\n<@${randomLove}> wins the lottery and receives mandatory affection.`);
}

/**
 * Adjust values.
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * */
function inc(client, message) {
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
    recordDamage(client, message, damageDealt);
    love.inc(message.author.id, message.author.permLevel > 0);

    exports.Enmap.inc(message.channel.id, "current.posts");
    exports.Enmap.inc(message.channel.id, "overall.posts");
    exports.Enmap.set(message.channel.id, newHealth, "health.current");
    if (newHealth <= 0) { 
        levelUp(client, message);
    }
    updateChannel(client, message);
}

function yeet(client, message) { 
    // Yeet the member via role
    const roleID = exports.Enmap.get(message.channel.id, "role");
    message.member.roles.add(roleID).catch(console.error);

    // Yeet by length of 1 minute * unique users * consecutive posts
    // Half time if over average love.
    const time = (+new Date() / 1000);
    const overallUsers = exports.Enmap.get(message.channel.id, "overall.users").length;
    const overallPosts = exports.Enmap.get(message.channel.id, "overall.posts");
    const yeetedLength = 60 * Math.round(
        (overallUsers + overallPosts) /
            love.compare(message.author.id) ? 2 : 1
    );
    const yeetedMinutes = Math.round((yeetedLength) / 60);
    manager.RoleManager.TimedRoles.Set(message.guild.id, message.member.id, roleID, time + yeetedLength);

    love.dec(message.author.id, message.author.permLevel > 0);

    const str = `
***${riz.Games.GetYeetedString(message.author)} [${yeetedMinutes}m]***

*Overall: ${overallUsers} users posted emojis ${overallPosts} consecutive times.*`;
    message.channel.send(str);
}

/**
 * Remove a emoji battle royale channel.
 * TODO: Fix the yeet length
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 * */
function reset(client, message, args) {
    const obj = {
        users: [],
        posts: 0,
        damage: 0,
    };
    exports.Enmap.set(message.channel.id, obj, "current");
    exports.Enmap.set(message.channel.id, obj, "overall");
    exports.Enmap.set(message.channel.id, {}, "participants");
    exports.Enmap.set(message.channel.id, 1, "level");
    exports.Enmap.set(message.channel.id, 2, "health.total");
    exports.Enmap.set(message.channel.id, 2, "health.current");
    exports.Enmap.set(message.channel.id, getSuperEmojis(client, message), "emojis");
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

    reset(client, message);
    updateChannel(client, message);
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
        reset(client, message);
    } else { 
        inc(client, message);
    }
};
