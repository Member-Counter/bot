const prefix = process.env.DISCORD_PREFIX;
const owners = process.env.BOT_OWNERS.split(/,\s?/);
const GuildModel = require("../../mongooseModels/GuildModel");
const updateCounter = require("../utils/updateCounter");
const Discord = require("discord.js");

const enable = {
    name: "enable",
    commands: [prefix+"enable"],
    allowedTypes: ["text"],
    indexZero: true, 
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            GuildModel.findOneAndUpdate({ guild_id:message.guild.id }, {}, {upsert: true, new: true})
                .then((result) => {
                    const args = message.content.split(" ");
                    let channelsToEnable = [];
                    if (message.mentions.channels.size > 0) {
                        channelsToEnable = message.mentions.channels.keyArray();
                    } else if (args[args.length - 1] === "all") {
                        channelsToEnable = message.guild.channels.filter(channel => channel.type === "text").keyArray();
                    } else {
                        channelsToEnable = [message.channel.id]
                    }
                    channelsToEnable.forEach(channel_id => {
                        if (!result.enabled_channels.includes(channel_id)) result.enabled_channels.push(channel_id);
                    })
                    result.save()
                        .then(() => {
                            updateCounter(client, message.guild.id);
                            let channelsToMention = "";
                            channelsToEnable.forEach((channel, i) => {
                                channelsToMention += ` <#${channel}>${(i === channelsToEnable.length-1) ? '.' : ','}`; 
                            });
                            message.channel.send(translation.commands.enable.success.replace("{CHANNELS}", channelsToMention)).catch(console.error)
                        })
                        .catch((e) => {
                            console.error(e);
                            message.channel.send(translation.common.error_db).catch(console.error);
                        })
                })
                .catch((e) => {
                    console.error(e);
                    message.channel.send(translation.common.error_db).catch(console.error);
                });
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const disable = {
    name: "disable",
    commands: [prefix+"disable"],
    allowedTypes: ["text"],
    indexZero: true, 
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            GuildModel.findOneAndUpdate({guild_id:message.guild.id}, {}, {upsert: true})
                .then((result) => {
                    const args = message.content.split(" ");
                    let channelsToDisable = [];
                    if (message.mentions.channels.size > 0) {
                        channelsToDisable = message.mentions.channels.keyArray();
                    } else if (args[args.length - 1] === "all") {
                        channelsToDisable = result.enabled_channels;
                    } else {
                        channelsToDisable = [message.channel.id]
                    }
                    result.enabled_channels = result.enabled_channels.filter(x => channelsToDisable.indexOf(x) === -1);
                    result.save()
                        .then(() => {
                            channelsToDisable.forEach(channel_id => {
                                client.channels.get(channel_id).setTopic('').catch(console.error);
                            })
                            let channelsMentioned = "";
                            channelsToDisable.forEach((channel, i) => {
                                channelsMentioned += ` <#${channel}>${(i === channelsToDisable.length-1) ? '.' : ','}`; 
                            });
                            message.channel.send(translation.commands.disable.success.replace("{CHANNELS}", channelsMentioned)).catch(console.error)
                        })
                        .catch(() => {
                            console.error(e);
                            message.channel.send(translation.common.error_db).catch(console.error);
                        })
                })
                .catch((e) => {
                    console.error(e);
                    message.channel.send(translation.common.error_db).catch(console.error);
                });
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const list = {
    name: "list",
    commands: [prefix+"list"],
    allowedTypes: ["text"],
    indexZero: true, 
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            GuildModel.findOne({ guild_id:message.guild.id })
                .then((result) => {
                    if (result) {
                        if (result.enabled_channels.length === 0) { 
                            message.channel.send(translation.commands.list.no_channels).catch(console.error);
                        } else {
                            let msg = translation.commands.list.list;
                            result.enabled_channels.forEach((channel, i) => {
                                msg += ` <#${channel}>${(i === result.enabled_channels.length-1) ? '.' : ','}`; 
                            });
                            message.channel.send(msg).catch(console.error);   
                        }
                    } else {
                        message.channel.send(translation.commands.list.no_channels).catch(console.error);
                    }
                })
                .catch((e) => {
                    console.error(e);
                    message.channel.send(translation.common.error_db).catch(console.error);
                });
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const reset = {
    name: "reset",
    commands: [prefix+"reset"],
    allowedTypes: ["text"],
    indexZero: true, 
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            GuildModel.findOneAndRemove({ guild_id:message.guild.id })
                .then((result) => {
                    if (result) {
                        result.enabled_channels.forEach(channel_id => {
                            client.channels.get(channel_id).setTopic('').catch(console.error)
                        });
                    }
                    message.channel.send(translation.commands.reset.done).catch(console.error);
                })
                .catch(e => {
                    message.channel.send(translation.common.error_db).catch(console.error);
                })
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const setDigit = {
    name: "setDigit",
    commands: [prefix+"setDigit"],
    allowedTypes: ["text"],
    indexZero: true,
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            const args = message.content.split(" ");
            if (args.length === 3) {
                const digitToUpdate = args[1].slice(0, 1);
                const newDigitValue = args[2];
                GuildModel.findOne({guild_id:message.guild.id})
                    .then((guild_settings) => {
                        guild_settings.custom_numbers[digitToUpdate] = newDigitValue
                        guild_settings.save()
                            .then(() => {
                                message.channel.send(translation.commands.setDigit.success).catch(console.error);
                                updateCounter(client, message.guild.id);
                            })
                            .catch((e) => {
                                message.channel.send(translation.common.error_db).catch(console.error);
                            });
                    })
                    .catch(() => {
                        message.channel.send(translation.common.error_db).catch(console.error);
                    });
            } else {
                message.channel.send(translation.commands.setDigit.error_missing_params.replace("{PREFIX}", prefix)).catch(console.error)
            }
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const setTopic = {
    name: "setTopic",
    commands: [prefix+"setTopic"],
    allowedTypes: ["text"],
    indexZero: true,
    enabled: true,
    run: (client, message, translation) => {
        GuildModel.findOneAndUpdate({ guild_id:message.guild.id }, {}, { upsert:true, new: true })
            .then(result => {
                if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
                    const args = message.content.split(/\s+/);
                    let channelsToCustomize = [];
                    let newTopic = "";

                    //check if the topic must be setted for specific channels
                    for (let i = 0; i < args.length; i++) {
                        const arg = args[i];
                        if (i !== 0) {
                            if (arg.slice(0, 2) === "<#" && arg.slice(-1) === ">") {
                                channelsToCustomize.push(arg.push(3, -1));
                            } else {
                                
                            };
                        }
                    }

                    //extract topic

                    //save changes
                    if (channelsToCustomize) {
                        channelsToCustomize.forEach(channel_id => {
                            result.unique_topics.set(channel_id, newTopic);
                        });
                        result.save()
                            .then(() => {

                            })
                            .catch(() => {
                                message.channel.send(translation.common.error_db).catch(console.error);
                            })
                    } else {
                        result.topic = newTopic;
                        result.save()
                            .then(() => {
                                
                            })
                            .catch(() => {
                                message.channel.send(translation.common.error_db).catch(console.error);
                            })
                    }

                }
            })
            .catch((e) => {
                console.log(e)
                message.channel.send(translation.common.error_db).catch(console.error);
            });
    }
}

const removeTopic = {
    name: "removeTopic",
    commands: [prefix+"removeTopic"],
    allowedTypes: ["text"],
    indexZero: true,
    enabled: false,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {

        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error)
        }
    }
}

const update = {
    name: "update",
    commands: [prefix+"update"],
    allowedTypes: ["text"],
    indexZero: true,
    enabled: true,
    run: (client, message, translation) => {
        if (message.member.hasPermission('ADMINISTRATOR') || owners.includes(message.member.id)) {
            updateCounter(client, message.guild.id);
            message.channel.send(translation.commands.update.success).catch(console.error);
        } else {
            message.channel.send(translation.commands.common.error_no_admin).catch(console.error);
        }
    }
}

module.exports = [ enable, disable, list, reset, setDigit, setTopic, removeTopic, update ];