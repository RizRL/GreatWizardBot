const ebr = require("../modules/emojibattleroyale.js");
const logger = require("../modules/logger.js");
const love = require("../modules/love.js");
const manager = require("../modules/discord-manager");
const riz = require("../modules/riz.js");
const sequence = require("../modules/sequence.js");

module.exports = async client => {

    // The Manager handles things like automatic message deletion, and giving / taking roles.
    // This goes first because it's used in many other places.
    await manager.init(client);

    // Games that utilize Enmap have an init
    // to ensure their Enmap is loaded before being used.
    await Promise.all([
        ebr.init(client),
        love.init(client),
        sequence.init(client),
    ]);

    client.user.setActivity(`with fire. ${riz.Unicode.Fire}`, { type: "PLAYING" });

    // Log that the bot is online.
    logger.log(`${client.user.tag}, ready to serve ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users in ${client.guilds.cache.size} servers.`, "ready");

};
