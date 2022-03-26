const { pingCounter } = require("../settings.js");

module.exports = async (client, msg) => {
    const count = pingCounter.ensure(msg.author.id, 1);
    return `You've pinged me ${count} times.`;
};
