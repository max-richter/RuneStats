const Discord = require("discord.js");
const request = require("request").defaults({
    timeout: 15000 // request times out after 15 seconds
});
const cheerio = require("cheerio");
const client = new Discord.Client();
const prefix = "!";
const config = require("./config");
const playerURL = "https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws?user1=";
const ironmanURL = "https://secure.runescape.com/m=hiscore_oldschool_ironman/hiscorepersonal.ws?user1=";
const ultimateURL = "https://secure.runescape.com/m=hiscore_oldschool_ultimate/hiscorepersonal.ws?user1=";
const hardcoreURL = "https://secure.runescape.com/m=hiscore_oldschool_hardcore_ironman/hiscorepersonal.ws?user1=";
const pollURL = "http://services.runescape.com/m=poll/oldschool/index.ws";
const playerPic = "https://secure.runescape.com/m=avatar-rs/";

/**
 * Confirmation that bot is on, posted to terminal.
 * Number of servers displayed as bots activity in discord
 */
client.on("ready", () => {
    // logs info to terminal
    console.log(`Bot is on, with ${client.users.size} users, in ${client.channels.size} channels 
    of ${client.guilds.size} servers.`);
    // sets bots activity to display runestats site
    client.user.setActivity('runestats.xyz', {
        type: "PLAYING"
    });
});

/**
 * Handles all message requests
 */
client.on("message", async msg => {

    // ignores messages from bots & regular messages
    if (msg.author.bot || !msg.content.startsWith(prefix)) {
        return;
    }

    // separates arguments from commands, includes support for usernames with whitespaces
    const tempArgs = msg.content.slice(prefix.length).split((' '));
    const command = tempArgs.shift().toLowerCase();
    const args = msg.content.split(prefix + command);
    var displayUser = args[1].trimLeft(); // removes whitespace from argument

    // replaces whitespace with '+' to fix URL promise rejection
    for (let i = 0; i < 6; i++) {
        args[1] = args[1].trimLeft().replace(' ', '+');
    }

    // core player search implementation
    if (command === "search") {
        // check if user provides a username
        if (args[1] === '') {
            msg.channel.send(":loudspeaker: **Please provide a username!**");
        } else {
            // success message sent, username stored to array
            var username = args[1];
            msg.channel.send(':mag_right: Searching OSRS stats for **' + displayUser + "**");

            // begin the search
            request(playerURL + username, function (error, response, html) {
                // check if website was reached successfully
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    // arrays that hold player data
                    var skillsArr = new Array();
                    var lvlArr = new Array();
                    var xpArr = new Array();

                    // find stats
                    $('tr').each(function (i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text());

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + displayUser + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (let i = 0; i < 24; i++) {
                            skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                        }
                        // put LVL/XP into array with formatting
                        var lvlXPArr = new Array();
                        for (let i = 0; i < 24; i++) {
                            lvlXPArr.push("LVL: *" + lvlArr[i] + "*\nXP: *" + xpArr[i] + "*");
                        }
                        // calls function that sends rich embed
                        embeddedMessage();
                    }

                    // format and send rich embed
                    function embeddedMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(playerURL + username)
                            .setAuthor(displayUser + "'s " + "OSRS Stats")
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
    } else if (command === "polls") { // posts latest poll info
        msg.channel.send(":bulb: Grabbing latest poll information!");
        const linkToPoll = "http://services.runescape.com/m=poll/oldschool/";

        // search for poll info
        request(pollURL, function (error, response, html) {
            // check if page is up
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var prevPollArr = new Array();
                var linkArr = new Array();

                // search for poll elements
                $('div').each(function (i, element) {
                    var polls = $(this).children().closest('b');
                    var links = $(this).children().closest('a').attr('href');
                    // only add result urls to array
                    if (links !== undefined) {
                        if (links.charAt(0) === 'r') {
                            linkArr.push(links);
                        }
                    }
                    prevPollArr.push(polls.text()); // pushes poll titles to array
                });
                var cleanArr = prevPollArr.filter(poll => poll.length > 4); // remove garbage elements
                linkMessage(); // calls function that creates/sends embed

                // format and send rich embed
                function linkMessage() {
                    const linkedEmbed = new Discord.RichEmbed()
                        .setColor("#86C3FF")
                        .setAuthor("Latest Poll Information")
                        .setFooter("@max-richter", client.user.avatarURL)
                        .setTitle("Click *Results* to view detailed overview of the final results")
                        .setThumbnail("https://i.imgur.com/Cp0d6xl.png")
                        .setTimestamp()
                        .addField("__**" + cleanArr[0] + "**__", "[Results](" + linkToPoll + linkArr[0] + ")")
                        .addField("__**" + cleanArr[1] + "**__", "[Results](" + linkToPoll + linkArr[1] + ")")
                        .addField("__**" + cleanArr[2] + "**__", "[Results](" + linkToPoll + linkArr[2] + ")")
                    msg.channel.send(linkedEmbed);
                }
            }
        });
    } else if (command === "help") { // posts list of commands and their functions
        var searchCom = "!search <username> - retrieves stats for specified user\n";
        var ironmanCom = "!ironman <username> - retrieves ironman stats for specified user\n";
        var ultimateCom = "!ultimate <username> - retrieves ultimate ironman stats for specified user\n";
        var hardcoreCom = "!hardcore <username> - retrieves hardcore ironman stats for specified user\n";
        var pollsCom = "!polls - lists all skills for specified user";

        msg.channel.send(":bookmark: Still have questions? Head to https://runestats.xyz/ to see FAQ's!\n" +
            "```" + searchCom + ironmanCom + ultimateCom + hardcoreCom + pollsCom +
            "```");
    } else if (command === "ironman") { // search functionality for pulling ironman stats
        if (args[1] === '') {
            msg.channel.send(":loudspeaker: **Please provide a username!**");
        } else {
            // success message sent, username stored to array
            var username = args[1];
            msg.channel.send(':mag_right: Searching OSRS stats for **' + displayUser + "**");

            // begin the search
            request(ironmanURL + username, function (error, response, html) {
                // check if website was reached successfully
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    // arrays that hold player data
                    var skillsArr = new Array();
                    var lvlArr = new Array();
                    var xpArr = new Array();

                    // find stats
                    $('tr').each(function (i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text());

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + displayUser + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (let i = 0; i < 24; i++) {
                            skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                        }
                        // put LVL/XP into array with formatting
                        var lvlXPArr = new Array();
                        for (let i = 0; i < 24; i++) {
                            lvlXPArr.push("LVL: *" + lvlArr[i] + "*\nXP: *" + xpArr[i] + "*");
                        }
                        // calls function that sends rich embed
                        ironmanMessage();
                    }

                    // format and send rich embed
                    function ironmanMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(ironmanURL + username)
                            .setAuthor(displayUser + "'s " + "OSRS Stats")
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
    } else if (command === "ultimate") {
        // post message if command doesn't exist
        if (args[1] === '') {
            msg.channel.send(":loudspeaker: **Please provide a username!**");
        } else {
            // success message sent, username stored to array
            var username = args[1];
            msg.channel.send(':mag_right: Searching OSRS stats for **' + displayUser + "**");

            // begin the search
            request(ultimateURL + username, function (error, response, html) {
                // check if website was reached successfully
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    // arrays that hold player data
                    var skillsArr = new Array();
                    var lvlArr = new Array();
                    var xpArr = new Array();

                    // find stats
                    $('tr').each(function (i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text());

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + displayUser + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (let i = 0; i < 24; i++) {
                            skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                        }
                        // put LVL/XP into array with formatting
                        var lvlXPArr = new Array();
                        for (let i = 0; i < 24; i++) {
                            lvlXPArr.push("LVL: *" + lvlArr[i] + "*\nXP: *" + xpArr[i] + "*");
                        }
                        // calls function that sends rich embed
                        ultimateMessage();
                    }

                    // format and send rich embed
                    function ultimateMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(ultimateURL + username)
                            .setAuthor(displayUser + "'s " + "OSRS Stats")
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
    } else if (command === "hardcore") {
        // post message if command doesn't exist
        if (args[1] === '') {
            msg.channel.send(":loudspeaker: **Please provide a username!**");
        } else {
            // success message sent, username stored to array
            var username = args[1];
            msg.channel.send(':mag_right: Searching OSRS stats for **' + displayUser + "**");

            // begin the search
            request(hardcoreURL + username, function (error, response, html) {
                // check if website was reached successfully
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    // arrays that hold player data
                    var skillsArr = new Array();
                    var lvlArr = new Array();
                    var xpArr = new Array();

                    // find stats
                    $('tr').each(function (i, element) {
                        // store element objects
                        var skills = $(this).next().children().children(); // skills
                        var skillLvl = $(this).next().children().eq(3); // skill levels
                        var xp = $(this).next().children().eq(4); // xp

                        skillsArr.push(skills.text());
                        lvlArr.push(skillLvl.text());
                        xpArr.push(xp.text());

                    });

                    // sort skills
                    skillsArr = skillsArr.splice(4);
                    lvlArr = lvlArr.splice(4);
                    xpArr = xpArr.splice(4);

                    // check if user was found in db
                    if (skillsArr[0] == undefined) {
                        msg.channel.send(":x: **" + displayUser + "** wasn't found!");
                    } else {
                        // fix formatting issues
                        for (let i = 0; i < 24; i++) {
                            skillsArr[i] = skillsArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            lvlArr[i] = lvlArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                            xpArr[i] = xpArr[i].replace(/(\r\n|\n|\r)/gm, " ");
                        }
                        // put LVL/XP into array with formatting
                        var lvlXPArr = new Array();
                        for (let i = 0; i < 24; i++) {
                            lvlXPArr.push("LVL: *" + lvlArr[i] + "*\nXP: *" + xpArr[i] + "*");
                        }
                        // calls function that sends rich embed
                        hardcoreMessage();
                    }

                    // format and send rich embed
                    function hardcoreMessage() {
                        const embed = new Discord.RichEmbed()
                            .setColor("#86C3FF")
                            .setTitle("View Complete Stat Page")
                            .setURL(hardcoreURL + username)
                            .setAuthor(displayUser + "'s " + "OSRS Stats")
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
    } else {
        msg.channel.send(":rotating_light: **Command not found!** Type **!help** for a list of commands");
    }
});

// bot token, also logs the authentification process
client.login(config.token).catch(err => console.log('Failed to authenticate with token'));