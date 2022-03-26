const { commandUtils } = require("../settings.js");

module.exports = async (client, msg) => {
    commandUtils.set("f3", Number(commandUtils.ensure("f3", 0) + 1));
    return `${commandUtils.get("f3")}`;
};
