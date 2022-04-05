// eslint-disable-next-line no-unused-vars
const { Intents, Message } = require("discord.js");

const love = require("./modules/love.js");

const permNames = {
    USER: "User",
    FAVORITE: "Favorite",
    SUBSCRIBER: "Subscriber",
    MODERATOR: "Moderator",
    ADMINISTRATOR: "Administrator",
    SERVER_OWNER: "Server Owner",
    BOT_SUPPORT: "Bot Support",
    BOT_ADMIN: "Bot Admin",
    BOT_OWNER: "Bot Owner",
};

/**
 * Config referenced in index
 */
const config = {
    /**
     * Bot Admins, level 9 by default. Array of user ID strings.
     */
    "admins": ["190866782926536704"],

    /**
     * Bot Support, level 8 by default. Array of user ID strings
     */
    "support": [],

    /*
     * Intents the bot needs.
     * By default GuideBot needs Guilds, Guild Messages and Direct Messages to work.
     * For join messages to work you need Guild Members, which is privileged and requires extra setup.
     * For more info about intents see the README.
     */
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
    
    /**
     * Partials your bot may need should go here, CHANNEL is required for DM's
     */
    partials: ["CHANNEL"],

    /**
      * Default per-server settings. These settings are entered in a database on first load, 
      * And are then completely ignored from this file. To modify default settings, use the `conf` command.
      * DO NOT REMOVE THIS BEFORE YOUR BOT IS LOADED AND FUNCTIONAL.
      */
    "defaultSettings" : {
        "prefix": "!",
        "modLogChannel": "logs",
        "modRole": "Moderator",
        "adminRole": "Administrator",
        "ttvSubRole": "Twitch Subscriber",
        "ttvSubRoleTier1": "Twitch Subscriber: Tier 1",
        "ttvSubRoleTier2": "Twitch Subscriber: Tier 2",
        "ttvSubRoleTier3": "Twitch Subscriber: Tier 3",
        "systemNotice": "false", // This gives a notice when a user tries to run a command that they do not have permission to use.
        "commandReply": "false", // Toggle this if you want the bot to ping the command executor or not.
        "welcomeChannel": "welcome",
        "welcomeMessage": "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D",
        "welcomeEnabled": "false"
    },

    // PERMISSION LEVEL DEFINITIONS.

    permNames: permNames,

    permLevels: [
        /**
         * This is the lowest permission level, this is for users without a role.
         */
        {
            level: 0,
            name: permNames.USER, 
            /**
             * Don't bother checking, just return true which allows them to execute any command their
             * level allows them to.
             */
            check: () => true
        },

        {
            level: 1,
            name: permNames.FAVORITE,
            /**
             * @param {Message} message 
             */
            check: (message) => {
                try {
                    return love.compare(message.author.id);
                } catch (e) {
                    return false;
                }
            }
        },

        {
            level: 2,
            name: permNames.SUBSCRIBER,
            /**
             * @param {Message} message 
             */
            check: (message) => {
                try {
                    const subRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.ttvSubRole.toLowerCase());
                    if (subRole && message.member.roles.cache.has(subRole.id)) {
                        return true;
                    }
                } catch (e) {
                    return false;
                }
            }
        },

        /**
         * This is your permission level, the staff levels should always be above the rest of the roles.
         */
        {
            level: 4,
            /**
             * This is the name of the role.
             */
            name: permNames.MODERATOR,
            /**
             * The following lines check the guild the message came from for the roles.
             * Then it checks if the member that authored the message has the role.
             * If they do return true, which will allow them to execute the command in question.
             * If they don't then return false, which will prevent them from executing the command.
             * @param {Message} message 
             */
            check: (message) => {
                try {
                    const modRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase());
                    if (modRole && message.member.roles.cache.has(modRole.id)) {
                        return true;
                    }
                } catch (e) {
                    return false;
                }
            }
        },

        {
            level: 6,
            name: permNames.ADMINISTRATOR,
            /**
             * @param {Message} message 
             */
            check: (message) => {
                try {
                    const adminRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase());
                    return (adminRole && message.member.roles.cache.has(adminRole.id));
                } catch (e) {
                    return false;
                }
            }
        },
    
        /**
         * This is the server owner.
         */
        {
            level: 8,
            name: permNames.SERVER_OWNER,
            /**
             * Simple check, if the guild owner id matches the message author's ID, then it will return true.
             * Otherwise it will return false.
             * @param {Message} message 
             */
            check: (message) => {
                const serverOwner = message.author ?? message.user;
                return message.guild?.ownerId === serverOwner.id;
            }
        },
    
        /**
         * Bot Support is a special in between level that has the equivalent of server owner access
         * to any server they joins, in order to help troubleshoot the bot on behalf of owners.
         */
        {
            level: 10,
            name: permNames.BOT_SUPPORT,
            /**
             * The check is by reading if an ID is part of this array. Yes, this means you need to
             * change this and reboot the bot to add a support user. Make it better yourself!
             * @param {Message} message 
             */
            check: (message) => {
                const botSupport = message.author ?? message.user;
                return config.support.includes(botSupport.id);
            }
        },

        /**
         * Bot Admin has some limited access like rebooting the bot or reloading commands.
         */
        {
            level: 11,
            name: permNames.BOT_ADMIN,
            /**
             * @param {Message} message 
             */
            check: (message) => {
                const botAdmin = message.author ?? message.user;
                return config.admins.includes(botAdmin.id);
            }
        },

        /**
         * This is the bot owner, this should be the highest permission level available.
         * The reason this should be the highest level is because of dangerous commands such as eval
         * or exec (if the owner has that).
         * Updated to utilize the Teams type from the Application, pulls a list of "Owners" from it.
         */
        {
            level: 12,
            name: permNames.BOT_OWNER, 
            /**
             * Another simple check, compares the message author id to a list of owners found in the bot application.
             * @param {Message} message 
             */
            check: (message) => {
                const owner = message.author ?? message.user;
                return owner.id === process.env.OWNER;
            }
        }
    ]
};

module.exports = config;
