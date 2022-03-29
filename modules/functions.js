const logger = require("./logger.js");
const config = require("../config.js");
const { settings } = require("./settings.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.

/*
  PERMISSION LEVEL FUNCTION

  This is a very basic permission system for commands which uses "levels"
  "spaces" are intentionally left black so you can add them if you want.
  NEVER GIVE ANYONE BUT OWNER THE LEVEL 10! By default this can run any
  command including the VERY DANGEROUS `eval` and `exec` commands!

  */
function permlevel(message) {
    let permlvl = 0;

    const permOrder = config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

    while (permOrder.length) {
        const currentLevel = permOrder.shift();
        if (message.guild && currentLevel.guildOnly) {
            continue;
        }
        if (currentLevel.check(message)) {
            permlvl = currentLevel.level;
            break;
        }
    }
    return permlvl;
}

/*
  GUILD SETTINGS FUNCTION

  This function merges the default settings (from config.defaultSettings) with any
  guild override you might have for particular guild. If no overrides are present,
  the default settings are used.

*/
  
// getSettings merges the client defaults with the guild settings. guild settings in
// enmap should only have *unique* overrides that are different from defaults.
function getSettings(guild) {
    settings.ensure("default", config.defaultSettings);
    if (!guild) {
        return settings.get("default");
    }
    const guildConf = settings.get(guild.id) || {};
    // This "..." thing is the "Spread Operator". It's awesome!
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    return ({
        ...settings.get("default"),
        ...guildConf 
    });
}

/*
  SINGLE-LINE AWAIT MESSAGE

  A simple way to grab a single reply, from the user that initiated
  the command. Useful to get "precisions" on certain things...

  USAGE

  const response = await awaitReply(msg, "Favourite Color?");
  msg.reply(`Oh, I really love ${response} too!`);

*/
async function awaitReply(msg, question, limit = 60000) {
    const filter = m => m.author.id === msg.author.id;
    await msg.channel.send(question);
    try {
        const collected = await msg.channel.awaitMessages({
            filter,
            max: 1,
            time: limit,
            errors: ["time"] 
        });
        return collected.first().content;
    } catch (e) {
        return false;
    }
}


/* MISCELLANEOUS NON-CRITICAL FUNCTIONS */
  
// toProperCase(String) returns a proper-cased string such as: 
// toProperCase("Mary had a little lamb") returns "Mary Had A Little Lamb"
function toProperCase(string) {
    return string.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function sortDirents(a, b) {
    if (a.isFile() && !b.isFile()) {
        return -1;
    }
    if (!a.isFile() && b.isFile()) {
        return 1;
    }

    if (a.isDirectory() && !b.isDirectory()) {
        return -1;
    }
    if (!a.isDirectory() && b.isDirectory()) {
        return 1;
    }

    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }
    return 0;
}

/**
     * COMMAND LOADING, UNLOADING, AND RELOADING
     */
async function getCommandFilePath(commandName, dirs) {
    if (!dirs) {
        dirs = [];
    }
    const root = "commands";
    const currentDir = `./${[root, ...dirs].join("/")}/`;
    const directory = await readdir(currentDir, {
        withFileTypes: true
    });
    directory.sort(sortDirents);

    // Declare an undefined variable for the file path,
    // and iterate over the commands directory until you find
    // the commandName file, then return the file path.
    let commandFilePath;
    for (const entry of directory) {
        switch (true) {
            case entry.isFile():
                if (entry.name != `${commandName}.js`) {
                    break;
                }
                commandFilePath = `../${[root, ...dirs, commandName].join("/")}`;
                break;

            case entry.isDirectory():
                commandFilePath = await getCommandFilePath(commandName, [...dirs, entry.name]);
                break;

            default:
                break;
        }
        if (commandFilePath) {
            break;
        }
    }
    return commandFilePath;
}

// Loads a command from path
// Will search for the path if not provided
async function loadCommand(client, commandName, path) {
    if (!path) {
        path = await getCommandFilePath(commandName);
    }
    try {
        logger.log(`Loading Command: ${commandName}`);
        const props = require(path);
        client.container.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.container.aliases.set(alias, props.help.name);
        });
        return false;
    } catch (e) {
        return `Unable to load command ${commandName}: ${e}`;
    }
}

async function unloadCommand(client, commandName) {
    let command;
    if (client.container.commands.has(commandName)) {
        command = client.container.commands.get(commandName);
    } else if (client.container.aliases.has(commandName)) {
        command = client.container.commands.get(client.container.aliases.get(commandName));
    }
    if (!command) {
        return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;
    }

    const path = await getCommandFilePath(commandName);
    const mod = require.cache[require.resolve(path)];
    delete require.cache[require.resolve(`${path}.js`)];
    for (let i = 0; i < mod.parent.children.length; i++) {
        if (mod.parent.children[i] === mod) {
            mod.parent.children.splice(i, 1);
            break;
        }
    }
    return false;
}

// Define a promise as an async function to load all 
// commands within a directory and its subdirectories.
// This will look at the top-level directory and any
// subdirectories alphabetically.
async function loadAllCommands(client, dirs) {
    if (!dirs) {
        dirs = [];
    }
    const root = "commands";
    const currentDir = [root, ...dirs].join("/");

    // The withFileTypes option makes this function return Dirents instead of Strings.
    // Dirents are objects that represent entries within a directory.
    const directory = await readdir(`./${currentDir}`, {
        withFileTypes: true
    });
    directory.sort(sortDirents);

    logger.log(`${currentDir}: Reading a total of ${directory.length} entries.`);
    for (const entry of directory) {
        switch (true) {
            // If the entry is a .js file, load it into memory as a command,
            // so it's accessible here and everywhere else.
            case entry.isFile(): {
                if (!entry.name.endsWith(".js")) {
                    break;
                }
                const response = await loadCommand(
                    client,
                    entry.name.split(".js")[0],
                    [`../${currentDir}`, entry.name].join("/")
                );
                if (response) {
                    logger.log(response);
                }
                break;
            }

            // If the entry is another directory, recursively call this function on it
            // after adding the entry's name to the dir array.
            case entry.isDirectory():
                await loadAllCommands(client, [...dirs, entry.name]);
                break;

            default:
                logger.log("Found a non-file, non-directory entry in the commands directory.");
                break;
        }
    }
    return;
}

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on("uncaughtException", (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    logger.error(`Uncaught Exception: ${errorMsg}`);
    console.error(err);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
    process.exit(1);
});

process.on("unhandledRejection", err => {
    logger.error(`Unhandled rejection: ${err}`);
    console.error(err);
});

module.exports = {
    getSettings,
    permlevel,
    awaitReply,
    toProperCase,
    loadCommand,
    unloadCommand,
    loadAllCommands,
};
