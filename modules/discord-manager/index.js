const messageManager = require("./scripts/messagemanager.js");
const roleManager = require("./scripts/rolemanager.js");

/**
 * Initialize all scripts of the Manager module.
 * @exports
 * */
exports.init = async (client) => {
    const [mes, role] = await Promise.all([
        messageManager.init(client),
        roleManager.init(client)
    ]);

    client.logger.log(["Manager Module initialized.", mes, role].join("\n"));
};

/**
 * A module for managing and deleting messages at an interval per channel.
 * @exports
 * */
exports.MessageManager = messageManager;

/**
 * A module for auto-roles and timed roles.
 * @exports
 * */
exports.RoleManager = roleManager;
