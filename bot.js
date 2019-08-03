const Discord = require("discord.js");
const request = require("request").defaults({
    timeout: 15000
});
const cheerio = require("cheerio");
const client = new Discord.Client();
const prefix = "!";
const config = require("./config");
const url = "https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws?user1=";
const playerPic = "https://secure.runescape.com/m=avatar-rs/";

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
                    //var rankArr = new Array(); TODO: think about whether to keep this or not
                    var lvlArr = new Array();
                    var xpArr = new Array(); 

                    // find stats
                    $('tr').each(function(i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        //var rank = $(this).next().children().eq(2); TODO: think about whether to keep this or not
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        //rankArr.push(rank.text()); TODO: think about whether to keep this or not
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text()); 

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);
                    //rankArr = rankArr.splice(4); TODO: think about whether to keep this or not

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + username + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (var i = 0; i < 24; i++) {
                        skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        //rankArr[i] = rankArr[i].replace(/(\r\n|\n|\r)/gm," "); TODO: think about whether to keep this or not
                        lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm," ");
                        }
                        // put LVL/XP into array with formatting
                        var lvlXPArr = new Array();
                        for (var i = 0; i < 24; i++) {
                            lvlXPArr.push("LVL: *" + lvlArr[i] + "*\nXP: *" + xpArr[i] + "*")
                        }
                        embeddedMessage();
                    }

                    // here the bot creates and sends an embedded message
                    function embeddedMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(url + username)
                            .setAuthor(username + "'s OSRS Stats")
                            .setThumbnail(playerPic + username + "/chat.png")
                            .setFooter("@max-richter", client.user.avatarURL)
                            .addField("__**Attack**__", lvlXPArr[1], true)
                            .addField("__**Defence**__", lvlXPArr[2], true)
                            .addField("__**Strength**__", lvlXPArr[3], true)
                            .addField("__**Hitpoints**__", lvlXPArr[4], true)
                            .addField("__**Ranged**__", lvlXPArr[5], true)
                            .addField("__**Prayer**__", lvlXPArr[6], true)
                            .addField("__**Magic**__", lvlXPArr[7], true)
                            .addField("__**Cooking**__", lvlXPArr[8], true)
                            .addField("__**Woodcutting**__", lvlXPArr[9], true)
                            .addField("__**Fletching**__", lvlXPArr[10], true)
                            .addField("__**Fishing**__", lvlXPArr[11], true)
                            .addField("__**Firemaking**__", lvlXPArr[12], true)
                            .addField("__**Crafting**__", lvlXPArr[13], true)
                            .addField("__**Smithing**__", lvlXPArr[14], true)
                            .addField("__**Mining**__", lvlXPArr[15], true)
                            .addField("__**Herblore**__", lvlXPArr[16], true)
                            .addField("__**Agility**__", lvlXPArr[17], true)
                            .addField("__**Thieving**__", lvlXPArr[18], true)
                            .addField("__**Slayer**__", lvlXPArr[19], true)
                            .addField("__**Farming**__", lvlXPArr[20], true)
                            .addField("__**Runecraft**__", lvlXPArr[21], true)
                            .addField("__**Hunter**__", lvlXPArr[22], true)
                            .addField("__**Construction**__", lvlXPArr[23], true)
                            .addField("__**Overall**__", lvlXPArr[0], true)
                            .setTimestamp()
                        msg.channel.send(embed);
                    }
                }
            });
        }       
    }
});

// bot token, also logs the authentification process
client.login(config.token).catch(err => console.log('Failed to authenticate with token'));