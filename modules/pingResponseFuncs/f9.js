module.exports = async (client, msg) => {
    return `${msg.guild.emojis.cache.random()}`;
};
