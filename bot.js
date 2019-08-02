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
                        embeddedMessage();
                    }

                    function embeddedMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(url + username)
                            .setAuthor(username + "'s OSRS Stats")
                            .setThumbnail(playerPic + username + "/chat.png")
                            .setFooter("@max-richter", client.user.avatarURL)
                            .addField("__**Attack**__", "LVL: *" + lvlArr[1] + "*\nXP: *" + xpArr[1] + "*", true)
                            .addField("__**Defence**__", "LVL: *" + lvlArr[2] + "*\nXP: *" + xpArr[2] + "*", true)
                            .addField("__**Strength**__", "LVL: *" + lvlArr[3] + "*\nXP: *" + xpArr[3] + "*", true)
                            .addField("__**Hitpoints**__", "LVL: *" + lvlArr[4] + "*\nXP: *" + xpArr[4] + "*", true)
                            .addField("__**Ranged**__", "LVL: *" + lvlArr[5] + "*\nXP: *" + xpArr[5] + "*", true)
                            .addField("__**Prayer**__", "LVL: *" + lvlArr[6] + "*\nXP: *" + xpArr[6] + "*", true)
                            .addField("__**Magic**__", "LVL: *" + lvlArr[7] + "*\nXP: *" + xpArr[7] + "*", true)
                            .addField("__**Cooking**__", "LVL: *" + lvlArr[8] + "*\nXP: *" + xpArr[8] + "*", true)
                            .addField("__**Woodcutting**__", "LVL: *" + lvlArr[9] + "*\nXP: *" + xpArr[9] + "*", true)
                            .addField("__**Fletching**__", "LVL: *" + lvlArr[10] + "*\nXP: *" + xpArr[10] + "*", true)
                            .addField("__**Fishing**__", "LVL: *" + lvlArr[11] + "*\nXP: *" + xpArr[11] + "*", true)
                            .addField("__**Firemaking**__", "LVL: *" + lvlArr[12] + "*\nXP: *" + xpArr[12] + "*", true)
                            .addField("__**Crafting**__", "LVL: *" + lvlArr[13] + "*\nXP: *" + xpArr[13] + "*", true)
                            .addField("__**Smithing**__", "LVL: *" + lvlArr[14] + "*\nXP: *" + xpArr[14] + "*", true)
                            .addField("__**Mining**__", "LVL: *" + lvlArr[15] + "*\nXP: *" + xpArr[15] + "*", true)
                            .addField("__**Herblore**__", "LVL: *" + lvlArr[16] + "*\nXP: *" + xpArr[16] + "*", true)
                            .addField("__**Agility**__", "LVL: *" + lvlArr[17] + "*\nXP: *" + xpArr[17] + "*", true)
                            .addField("__**Thieving**__", "LVL: *" + lvlArr[18] + "*\nXP: *" + xpArr[18] + "*", true)
                            .addField("__**Slayer**__", "LVL: *" + lvlArr[19] + "*\nXP: *" + xpArr[19] + "*", true)
                            .addField("__**Farming**__", "LVL: *" + lvlArr[20] + "*\nXP: *" + xpArr[20] + "*", true)
                            .addField("__**Runecraft**__", "LVL: *" + lvlArr[21] + "*\nXP: *" + xpArr[21] + "*", true)
                            .addField("__**Hunter**__", "LVL: *" + lvlArr[22] + "*\nXP: *" + xpArr[22] + "*", true)
                            .addField("__**Construction**__", "LVL: *" + lvlArr[23] + "*\nXP: *" + xpArr[23] + "*", true)
                            .addField("__**Overall**__", "LVL: *" + lvlArr[0] + "*\nXP: *" + xpArr[0] + "*", true)
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