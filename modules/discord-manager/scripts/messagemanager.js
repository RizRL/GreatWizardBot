const fs = require("fs");
const schedule = require("node-schedule");
const Util = {};

// helper obj to manage reading and writing the json
const MMJson = {
    Obj: null,
    Path: "./modules/discord-manager/jsons/messagemanager.json",
    // reads the path synchronously
    // parses the json and sets MMJson.Obj as it
    Read: function () {
        const file = fs.readFileSync(this.Path);
        const obj = JSON.parse(file);
        MMJson.Obj = obj;
    },
    // synchronously writes MMJson.Obj to the path
    Write: function () {
        const file = JSON.stringify(MMJson.Obj, null, 2);
        fs.writeFileSync(this.Path, file);
    },

    PushChannelRulesObj: function (channelRulesObj) {
        const arr =
            MMJson.Obj.ChannelRulesObjs
                .filter(channelRulesObj2 =>
                    ChannelRulesObj.GetChannelID(channelRulesObj2) !=
                    ChannelRulesObj.GetChannelID(channelRulesObj)
                );
        arr.push(channelRulesObj);
        MMJson.Obj.ChannelRulesObjs = arr;
        MMJson.Write();
    },

    PushManagedMessageObj: function (managedMessageObj) {
        MMJson.Obj.ManagedMessageObjs.push(managedMessageObj);
        MMJson.Write();
    },

    RemoveChannelRulesObjByChannelID: function (id) {
        if (!MMJson.GetChannelRulesByChannelID(id)) {
            return; 
        }
        const arr =
            this.GetAllChannelRulesObjs()
                .filter(channelRulesObj =>
                    ChannelRulesObj.GetChannelID(channelRulesObj) != id
                );
        this.SetChannelRulesObjs(arr);
    },

    RemoveManagedMessageObjByMessageID: function (id) {
        if (!MMJson.GetManagedMessageObjByMessageID(id)) {
            return; 
        }
        const arr =
            this.GetAllManagedMessageObjs()
                .filter(managedMessageObj =>
                    ManagedMessageObj.GetChannelID(managedMessageObj) != id
                );
        this.SetManagedMessageObjs(arr);
    },

    GetManagedChannelsCount: function () {
        return MMJson.Obj.ChannelRulesObjs.length;
    },

    GetManagedMessagesCount: function () {
        return MMJson.Obj.ManagedMessageObjs.length;
    },

    GetAllChannelRulesObjs: function () {
        return MMJson.Obj.ChannelRulesObjs;
    },

    GetAllManagedMessageObjs: function () {
        return MMJson.Obj.ManagedMessageObjs;
    },

    GetChannelRulesByChannelID: function (id) {
        return MMJson.GetAllChannelRulesObjs()
            .find(channelRulesObj =>
                ChannelRulesObj.GetChannelID(channelRulesObj) == id
            );
    },

    GetManagedMessageObjByMessageID: function (id) {
        return MMJson.GetAllManagedMessageObjs()
            .find(managedMessageObj =>
                ManagedMessageObj.GetMessageID(managedMessageObj) == id
            );
    },

    SetChannelRulesObjs: function (channelRulesObjs) {
        MMJson.Obj.ChannelRulesObjs = channelRulesObjs;
        MMJson.Write();
    },

    SetManagedMessageObjs: function (managedMessageObjs) {
        MMJson.Obj.ManagedMessageObjs = managedMessageObjs;
        MMJson.Write();
    }
};

const ChannelRulesObj = {
    New: function (channelID, lifespan) {
        if (!channelID) {
            channelID = ""; 
        }
        if (!lifespan) {
            lifespan = 60; 
        }
        const channelRulesObj = {
            ChannelID: channelID,
            MessageLifespan: lifespan
        };
        return channelRulesObj;
    },

    GetChannelID: function (channelRulesObj) {
        return channelRulesObj.ChannelID;
    },

    GetMessageLifespan: function (channelRulesObj) {
        return channelRulesObj.MessageLifespan;
    }
};

const ManagedMessageObj = {
    New: function (message, channelRulesObj) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const managedMessageObj = {
            MessageID: message.id,
            ChannelID: message.channel.id,
            DeleteAfterUnixTimestamp: currentTimestamp + ChannelRulesObj.GetMessageLifespan(channelRulesObj)
        };
        return managedMessageObj;
    },

    GetMessageID: function (managedMessageObj) {
        return managedMessageObj.MessageID;
    },

    GetChannelID: function (managedMessageObj) {
        return managedMessageObj.ChannelID;
    },

    GetDeleteAfterUnixTimestamp: function (managedMessageObj) {
        return managedMessageObj.DeleteAfterUnixTimestamp;
    }
};

// just logs a reference of the client
// for logging purposes throughout this script
function initialize(client) {
    MMJson.Read();
    Util.client = client;
    return Promise.resolve("MessageManager initialized.");
}

// returns true if there is a channelRulesObj
// for message.channel.id
function isChannelManaged(client, message) {
    if (!MMJson.Obj) {
        return false; 
    }
    if (message.channel.id == client.config.logChannels[client.user.id]) {
        return false; 
    }
    const channelRulesObj =
        MMJson.GetAllChannelRulesObjs().find(channelRulesObj =>
            ChannelRulesObj.GetChannelID(channelRulesObj) == message.channel.id
        );
    if (!channelRulesObj) {
        return false; 
    }
    return true;
}

function logMessage(client, message) {
    if (!isChannelManaged(client, message)) {
        return; 
    }
    const channelRulesObj = MMJson.GetChannelRulesByChannelID(message.channel.id);
    const managedMessageObj = ManagedMessageObj.New(message, channelRulesObj);
    MMJson.PushManagedMessageObj(managedMessageObj);
}

function logChannel(client, message, args) {
    const lifespan = Number(args[0]);

    if (isNaN(lifespan)) {
        switch (args[0]) {
            case "delete":
            case "remove":
            case "stop":
                if (!isChannelManaged(client, message)) {
                    break; 
                }
                MMJson.RemoveChannelRulesObjByChannelID(message.channel.id);
                message.channel.send(
                    "Messages sent in this channel will no longer be managed.")
                    .then(msg => {
                        message.delete(3000).catch(console.error);
                        msg.delete(3000).catch(console.error);
                    }).catch(console.error);
                return;

            default:
                return;
        }
    }

    const channelRulesObj = ChannelRulesObj.New(message.channel.id, lifespan);
    MMJson.PushChannelRulesObj(channelRulesObj);
    message.channel.send(
        `Messages sent in this channel now have a lifespan of ${lifespan} seconds.`)
        .then(msg => {
            message.delete(3000).catch(console.error);
            msg.delete(3000).catch(console.error);
        }).catch(console.error);
}

// check all managed messages
// if the message's delete timestamp is
// later than Date.now(), fetch and delete it
function purgeMessages() {
    if (!MMJson.Obj) {
        return; 
    } // stop if the Obj is null
    if (!MMJson.GetManagedMessagesCount()) {
        return; 
    } // stop if there are no managed messages

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const managedMessageObjs = MMJson.GetAllManagedMessageObjs();
    const messagesToDelete =
        managedMessageObjs.filter(
            managedMessageObj => ManagedMessageObj.GetDeleteAfterUnixTimestamp(managedMessageObj) <= currentTimestamp
        );
    const messagesToSave =
        managedMessageObjs.filter(
            managedMessageObj => ManagedMessageObj.GetDeleteAfterUnixTimestamp(managedMessageObj) > currentTimestamp
        );

    if (!messagesToDelete.length) {
        return; 
    } // stop if nothing was found to be deleted
    MMJson.SetManagedMessageObjs(messagesToSave);

    messagesToDelete.forEach(async (managedMessageObj) => {
        const channel = Util.client.channels.cache.get(ManagedMessageObj.GetChannelID(managedMessageObj));
        if (!channel) {
            return; 
        }
        const message = await channel.messages.fetch(ManagedMessageObj.GetMessageID(managedMessageObj)).catch(console.error);
        if (!message) {
            return; 
        }
        if (message.deleted) {
            return; 
        }
        message.delete().catch(console.error);
    });
}

// schedule the deletion check to happen every minute
schedule.scheduleJob({ second: 0 }, purgeMessages);

module.exports = {
    init: initialize,
    LogMessage: logMessage,
    LogChannel: logChannel
};
