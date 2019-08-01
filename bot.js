const Discord = require("discord.js");
const request = require("request");
const cheerio = require("cheerio");
const client = new Discord.Client();
const prefix = "!";
const config = require("./config");
const url = "https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws?user1=";

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
});

/**
 * Handles all message requests
 */
client.on("message", async msg => {

    // ignores messages from bots & regular messages
    if (msg.author.bot || !msg.content.startsWith(prefix)) {
        return;
    }

    // separates arguments from commands
    const args = msg.content.slice(prefix.length).split((' '));
    const command = args.shift().toLowerCase();

    // all commands that work 
    if (command === "test") {
        msg.channel.send("RuneStats is **[on]**");
    }

    // posts list of commands
    if (command === "help") { 
        msg.channel.send("```!search <username> (retrieves stats for specified user)\n\n" +
        "!skills <username> (lists all skills for specified user)```");
    }
    
    // player search functionality
    if (command === "search") {
    
        if (!args.length) {
            msg.channel.send("Please provide a username!");
        } else {
            var username = args[0];
            msg.channel.send(':mag_right: Searching OSRS stats for **' + username + "**");

            // begin the search
            request(url + username, function(error, response, html) {

                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    // arrays that hold player data
                    var skillsArr = new Array();
                    var rankArr = new Array();
                    var lvlArr = new Array();
                    var xpArr = new Array();

                    // find stats
                    $('tr').each(function(i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        var rank = $(this).next().children().eq(2); // rank
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        rankArr.push(rank.text());
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text());

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    rankArr = rankArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + username + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (var i = 0; i < 24; i++) {
                        skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        rankArr[i] = rankArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        }
                        msg.channel.send(skillsArr[0] + lvlArr[0] +  " " + rankArr[0] + " " + xpArr[0]); // testing output
                    }
                }

            });

        }
        
    }
});

// bot token, also logs the authentification process
client.login(config.token).catch(err => console.log('Failed to authenticate with token'));