const riz = require("../modules/riz");
const lair = require("../modules/lair");
const manager = require("../modules/discord-manager");

const logger = require("../modules/logger.js");
module.exports = async client => {
    // Log that the bot is online.
    logger.log(`${client.user.tag}, ready to serve ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users in ${client.guilds.cache.size} servers.`, "ready");

    // The Manager handles things like automatic message deletion, and giving / taking roles.
    await manager.init(client);

    // EMILIO's Lair is fun.
    await lair.init(client);

    // Make the bot "play the game" which is the help command with default prefix.
    client.user.setActivity(`with fire. ${riz.Unicode.Fire}`, { type: "PLAYING" });
};
