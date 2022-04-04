// eslint-disable-next-line no-unused-vars
const { Client, Guild, Message, TextChannel, Util } = require("discord.js");
const logger = require("../modules/logger.js");
const love = require("../modules/love.js");
const { pingCounter, pingResponses } = require("./settings.js");

const mentionRegex = /<(a)?:?((\w{2,32})|(@|#|&|!)*)?:?(\d{17,19})>/g;

function checkForWord(msg, word, checkMentions = false) {
    if (typeof word !== "string") {
        return false;
    }

    // Turn the provided word into a regex which
    // hits when the letters of the word can be found
    // in order, with any amount of letter between each.
    const exp = word
        .toLowerCase()
        .split("")
        .join("[\\s\\S]*");
    
    // Remove all mentions before checking for the word, if needed.
    const str = checkMentions
        ? msg.content
        : msg.content.replace(mentionRegex);
    const results = new RegExp(exp, "gi").exec(str);
    return !!results;
}

function getEmojis(guild, arr) {
    const emojis = [];
    for (let i = 0; i < arr.length; i++) {
        const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === arr[i].toLowerCase());
        if (emoji) {
            emojis.push(emoji);
        }
    }
    return emojis;
}

/**
 * Determine new SE emojis.
 * @param {Client} client
 * @param {Guild} guild
 * */
function getRandomEmojis(guild, amt = 1, allowAnim = true) {
    const emojis = [];
    let cache = guild.emojis.cache.filter(e => !e.deleted && e.available);
    if (!allowAnim) { 
        cache = cache.filter(e => !e.animated);
    }
    while (emojis.length < Math.min(amt, cache.size)) {
        const randEmoji = cache.random();
        if (emojis.filter(e => e.id == randEmoji.id)) {
            emojis.push(randEmoji);
        }
    }
    return emojis;
}

// If we're responding to pings, we've already ruled out
// that we may be running a command.
async function respondToPings(client, msg) {
    pingCounter.ensure(msg.author.id, 0);
    pingCounter.inc(msg.author.id);
    love.inc(msg.author.id, msg.author.permLevel > 0);

    // do something random
    const randomResponse = pingResponses.random();
    const key = pingResponses.findKey((e) => e == randomResponse);

    logger.log(`PING RESPONSE: #${key} selected.`);

    // Try to find a function by the key.
    // If we find it, we want the response to be whatever the function returns.
    // If there's no function, or it fails for some reason, 
    // default to the enmap response.
    let func;
    try {
        func = require(`./pingResponseFuncs/f${key}.js`);
        logger.log(`PING RESPONSE: #${key} function FOUND.`);
    } catch (e) {
        logger.log(`PING RESPONSE: #${key} function NOT FOUND.`);
    }

    const finalResponse = func
        ? await func(client, msg)
        : randomResponse;
    
    sendLargeMessage(msg.channel, finalResponse);
}

/**
 * @param {(Message|TextChannel)} target 
 * @param {string} str 
 * @param {string} char 
 * @returns 
 */
async function sendLargeMessage(target, str, char = "\n") {

    const msgArray = [];
    const strArray = Util.splitMessage(str, {
        char: char
    });
    while (strArray.length) {

        switch (true) { 
            case target instanceof Message: { 
                msgArray.push(await target.reply(strArray.shift()).catch(console.error));
                break;
            }
                
            case target instanceof TextChannel: { 
                msgArray.push(await target.send(strArray.shift()).catch(console.error));
                break;
            }
                
            default:
                break;
        }
    }

    return msgArray;
}

module.exports = {
    mentionRegex,
    checkForWord,
    getEmojis,
    getRandomEmojis,
    respondToPings,
    sendLargeMessage,
};
