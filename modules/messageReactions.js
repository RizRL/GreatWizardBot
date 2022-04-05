const config = require("../config.js");
const love = require("./love.js");
const messageUtils = require("./messageUtils.js");

module.exports = (client, msg) => {
    const [isExplosion, isNice] = [
        messageUtils.checkForWord(msg, "explosion") || messageUtils.checkForWord(msg, "explode"),
        msg.content.length === 69
    ];
    
    (async () => {
        const isSub = msg.author.permLevel >= client.container.levelCache[config.permNames.SUBSCRIBER];

        // Always check for explosion
        if (isExplosion) {
            msg.react(...messageUtils.getEmojis(msg.guild, ["youWHAT"]))
                .then(r => {
                    love.inc(msg.author.id, isSub);
                })
                .catch(console.error);
        }

        // Always check for nice
        if (isNice) {
            msg.react(...messageUtils.getEmojis(msg.guild, ["NICE"]))
                .then(r => {
                    love.inc(msg.author.id, isSub);
                })
                .catch(console.error);
        }

        // Sometimes nice just is
        if (Math.floor(Math.random() * 69) + 1 === 69) {
            msg.react(msg.guild.emojis.cache.random())
                .then(r => {
                    love.inc(msg.author.id, isSub);
                })
                .catch(console.error);
        }
    })().catch(console.error);
};
