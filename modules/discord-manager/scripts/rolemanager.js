// eslint-disable-next-line no-unused-vars
const Discord = require("discord.js");
const Enmap = require("enmap");
const schedule = require("node-schedule");

const Util = {};

/**
 * Save a reference of the client for later use.
 * @param {Discord.Client} client
 */
exports.init = async (client) => {
    await exports.Enmap.defer;
    exports.Enmap.ensure("autoRoles", {});
    exports.Enmap.ensure("timedRoles", {});
    Util["client"] = client;
    exports.TimedRoleRemoval = schedule.scheduleJob({ second: 0 }, exports.TimedRoles.Purge);
    return Promise.resolve("RoleManager initialized.");
};

exports.Enmap = new Enmap({ name: "roleManager" });

exports.AutoRoles = {
    /**
     * Add a new role to a guild's auto-roles.
     * @param {Discord.Snowflake} guildID
     * @param {Discord.Snowflake} roleID
     * @param {Number} time The amount of seconds the role should persist once added.
     * */
    New: function (guildID, roleID, time = 0) {
        let guildAutoRoles = exports.Enmap.ensure("autoRoles", [], guildID);
        guildAutoRoles = guildAutoRoles.filter(e => e.role != roleID);
        guildAutoRoles.push({
            role: roleID,
            time: time
        });
        exports.Enmap.set(
            "autoRoles",
            guildAutoRoles,
            guildID
        );
    },
    /**
     * Remove a role from a guild's auto-roles.
     * @param {Discord.Snowflake} guildID
     * @param {Discord.Snowflake} roleID
     * */
    Remove: function (guildID, roleID) {
        if (!exports.Enmap.has("autoRoles", guildID)) {
            return; 
        }
        let guildAutoRoles = exports.Enmap.get("autoRoles", guildID);
        guildAutoRoles = guildAutoRoles.filter(e => e.role != roleID);
        if (guildAutoRoles.length) {
            exports.Enmap.set(
                "autoRoles",
                guildAutoRoles,
                guildID
            );
        } else {
            exports.Enmap.delete("autoRoles", guildID);
        }
    },

    /**
     * Called on the guildMemberAdd event.
     * @param {Discord.GuildMember} member
     * */
    Add: async function (member) {
        const guildAutoRoles = exports.Enmap.get("autoRoles", member.guild.id);
        if (!guildAutoRoles) {
            return; 
        }

        const currentTime = Math.round(Date.now() / 1000);
        const roleIDArr = [];
        guildAutoRoles.forEach(role => {
            roleIDArr.push(role.role);
            if (role.time) {
                exports.TimedRoles.Set(member.guild.id, member.id, role.role, currentTime + Number(role.time));
            }
        });
        await member.roles.add(roleIDArr).catch(console.error);
        return Promise.resolve();
    }
};

exports.TimedRoles = {
    /**
     * Add a new role to a guild's timed roles, a role set to be removed from a member at a time.
     * @param {Discord.Snowflake} guildID
     * @param {Discord.Snowflake} memberID
     * @param {Discord.Snowflake} roleID
     * @param {Number} timeToRemove A Unix timestamp of when the role should be removed.
     * */
    Set: function (guildID, memberID, roleID, time) {
        exports.Enmap.ensure("timedRoles", {}, guildID);
        exports.Enmap.ensure("timedRoles", [], `${guildID}.${memberID}`);
        exports.Enmap.pushIn("timedRoles", `${guildID}.${memberID}`, {
            role: roleID,
            timeToRemove: time 
        });
    },

    /**
     * Runs at a set interval upon bot startup. 
     * Cleans out timed roles set to be removed, and removes them from their members.
     * */
    Purge: function () {
        const currentTime = Math.round(Date.now() / 1000);
        const timedRoles = exports.Enmap.get("timedRoles");

        for (const guildID in timedRoles) {
            const guild = Util.client.guilds.cache.get(guildID);
            if (!guild) {
                continue; 
            }

            for (const memberID in timedRoles[guildID]) {
                const member = guild.members.cache.get(memberID);
                if (!member) {
                    continue; 
                }

                timedRoles[guildID][memberID].forEach(timer => {
                    const roleArr = [];
                    if (timer.timeToRemove <= currentTime) {
                        roleArr.push(timer.role);
                    }
                    if (roleArr.length) {
                        member.roles.remove(roleArr); 
                    }
                });

                timedRoles[guildID][memberID]
                    = timedRoles[guildID][memberID].filter(
                        e => e.timeToRemove > currentTime
                    );
                if (!timedRoles[guildID][memberID].length) {
                    delete timedRoles[guildID][memberID]; 
                }
            }

            if (!Object.keys(timedRoles[guildID]).length) {
                delete timedRoles[guildID]; 
            }
        }

        exports.Enmap.set("timedRoles", timedRoles);
    }
};
