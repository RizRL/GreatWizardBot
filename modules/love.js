// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");

const Enmap = require("enmap");
const logger = require("../modules/logger.js");

exports.Enmap = new Enmap({ name: "loveFactor" });

exports.init = async (client) => {
    await exports.Enmap.defer;
    return Promise.resolve(logger.log("Love initialized."));
};

/**
 * Give a specific amount of love.
 * Can be negative.
 * @param {Discord.Snowflake} id 
 * @param {number} amt 
 */
exports.give = (id, amt) => { 
    const current = exports.Enmap.ensure(id, 0);
    exports.Enmap.set(id, current + amt);

    logger.log(`LOVE ${id} = ${current + amt}`);
};

/**
 * Give a default amount of love, determined interally.
 * Useful for non-specific instances of love-giving.
 * @param {Discord.Snowflake} id 
 */
exports.inc = (id, isSub = false) => {
    const value = isSub ? 5 : 3;
    exports.give(id, value);
};

/**
 * Take a default amount of love, determined interally.
 * Useful for non-specific instances of love-taking.
 * @param {Discord.Snowflake} id 
 */
exports.dec = (id, isSub = false) => {
    exports.give(id, -3);
};

/**
 * Retrieve current love.
 * @param {Discord.Snowflake} id 
 */
exports.get = (id) => {
    const current = exports.Enmap.ensure(id, 0);
    logger.log(`LOVE ${id} = ${current}`);

    return Number(current);
};

/**
 * Set a user's love.
 * @param {Discord.Snowflake} id 
 */
exports.set = (id, amt) => {
    exports.Enmap.set(id, amt);
    logger.log(`LOVE ${id} = ${amt}`);
};

/**
 * Check if a user is above or below average love.
 * @param {Discord.Snowflake} id 
 */
exports.compare = (id) => {
    const thisLove = exports.get(id);
    let above = 0;
    let below = 0;
    exports.Enmap.every((cur) => {
        thisLove >= cur ? above++ : below++;
    });
    return above > below;
};
