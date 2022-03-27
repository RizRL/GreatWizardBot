const messageUtils = require("./messageUtils.js");
const { loveFactor } = require("./settings.js");

module.exports = (msg) => {
    const [isExplosion, isNice] = [
        messageUtils.checkForWord(msg, "explosion") || messageUtils.checkForWord(msg, "explode"),
        msg.content.length === 69
    ];
    
    (async () => {
        // Always check for explosion
        if (isExplosion) {
            msg.react(...messageUtils.getEmojis(msg.guild, ["youWHAT"]))
                .then(r => {
                    loveFactor.ensure(msg.author.id, 0);
                    loveFactor.inc(msg.author.id);
                })
                .catch(console.error);
        }

        // Always check for nice
        if (isNice) {
            msg.react(...messageUtils.getEmojis(msg.guild, ["NICE"]))
                .then(r => {
                    loveFactor.ensure(msg.author.id, 0);
                    loveFactor.inc(msg.author.id);
                })
                .catch(console.error);
        }

        // Sometimes nice just is
        if (Math.floor(Math.random() * 69) + 1 === 69) {
            msg.react(msg.guild.emojis.cache.random())
                .then(r => {
                    loveFactor.ensure(msg.author.id, 0);
                    loveFactor.inc(msg.author.id);
                })
                .catch(console.error);
        }
    })().catch(console.error);
};
