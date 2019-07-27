const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "!";
const config = require("./config");

/**
 * Confirmation that bot is on, posted to terminal.
 * Number of servers displayed as bots activity in discord
 */
client.on("ready", () => {
    // logs info to terminal
    console.log(`Bot is on, with ${client.users.size} users, in ${client.channels.size} channels 
    of ${client.guilds.size} servers.`);
    // sets bots activity to display num of servers  TODO: change to !help possibly?
    client.user.setActivity(`I am in ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
    // update number of servers
    client.user.setActivity(`RuneStats is in ${client.guilds.size} servers`);
})

/**
 * Handles all message requests
 */
client.on("message", async msg => {
    // ignores messages from bots
    if (msg.author.bot) {
        return;
    }

    // checks if command starts with defined prefix
    if (!msg.content.startsWith(prefix)) {
        msg.channel.send("" + msg.content + " is not a valid command! Type !help for a full list of commands.");
    }

    // sets command to string after prefix
    const command = msg.content.substring(1);

    // test block, remove when done
    if (command === "test") {
        msg.channel.sendMessage("RuneStats is on!");
    }

    // list of commands TODO: find a better way to format ths
    if (command === "help") {
        msg.channel.sendMessage("```!search <username> (retrieves stats for specified user)\n" +
        "!skills <username> (lists all skills for specified user)```");
    }

})

// bot token, also logs the authentification process
client.login(config.token).catch(err => console.log('Failed to authenticate with token'));