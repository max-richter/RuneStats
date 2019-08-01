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

/**
 * Set's activity of the bot to number of servers it's used in
 */
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

    const commandArr = ["!test", "!help"]; // list of commands
    var existingCommand = commandArr.includes(msg.content); // T if found, F otherwise

    // checks if command starts with defined prefix
    if (msg.content.charAt(0) != prefix) {
        msg.channel.send(msg.content + " is not a valid command! Type !help for a full list of commands.");
    } else if (!existingCommand) {
        msg.channel.send(msg.content + " is not a valid command! Type !help for a full list of commands.");
    }

    // sets command to string after prefix
    const command = msg.content.substring(1);
    
    // all commands that work 
    if (command === "test") {
        msg.channel.sendMessage("RuneStats is on!");
    } 

    // posts list of commands
    if (command === "help") { 
        msg.channel.sendMessage("```!search <username> (retrieves stats for specified user)\n\n" +
        "!skills <username> (lists all skills for specified user)```");
    }
})

// bot token, also logs the authentification process
client.login(config.token).catch(err => console.log('Failed to authenticate with token'));