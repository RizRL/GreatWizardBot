const { Util } = require("discord.js");
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

// If we're responding to pings, we've already ruled out
// that we may be running a command.
async function respondToPings(client, msg) {
    pingCounter.ensure(msg.author.id, 0);
    pingCounter.inc(msg.author.id);

    // If there's no intent, do something random instead.
    const randomResponse = pingResponses.random();
    const key = pingResponses.findKey((e) => e == randomResponse);

    // Try to find a function by the key.
    // If we find it, we want the response to be whatever the function returns.
    // If there's no function, or it fails for some reason, 
    // default to the enmap response.
    let func;
    try {
        func = require(`./pingResponseFuncs/f${key}.js`);
    } catch (e) {
        client.logger.warn(e);
    }
    const finalResponse = func
        ? await func(client, msg)
        : randomResponse;

    sendLargeMessage(msg.channel, finalResponse);
}

async function sendLargeMessage(channel, str, char = " ") {
    const msgArray = [];
    const strArray = Util.splitMessage(str, {
        char: char
    });
    while (strArray.length) {
        msgArray.push(await channel.send(strArray.shift()).catch(console.error));
    }
    return msgArray;
}

module.exports = {
    mentionRegex,
    checkForWord,
    getEmojis,
    respondToPings,
    sendLargeMessage,
};
