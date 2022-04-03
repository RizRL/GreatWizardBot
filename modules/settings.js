const Enmap = require("enmap");
// Now we integrate the use of Evie's awesome Enmap module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
module.exports = {
    commandUtils: new Enmap({
        name: "commandUtils",
    }),
    pingResponses: new Enmap({
        name: "pingResponses",
    }),
    pingCounter: new Enmap({
        name: "pingCounter",
    }),
    settings: new Enmap({
        name: "settings",
    }),
};
