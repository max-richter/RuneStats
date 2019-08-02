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
                            .setTitle(username + "'s Stat Page")
                            .setURL(url + username)
                            .setAuthor("RuneStats")
                            .setThumbnail(playerPic + username + "/chat.png")
                            .setFooter("@max-richter", client.user.avatarURL)
                            .addField("**Overall**", lvlArr[0], true)
                            .addField("**Attack**", lvlArr[1], true)
                            .addField("**Defence**", lvlArr[2], true)
                            .addField("**Strength**", lvlArr[3], true)
                            .addField("**Hitpoints**", lvlArr[4], true)
                            .addField("**Ranged**", lvlArr[5], true)
                            .addField("**Prayer**", lvlArr[6], true)
                            .addField("**Magic**", lvlArr[7], true)
                            .addField("**Cooking**", lvlArr[8], true)
                            .addField("**Woodcutting**", lvlArr[9], true)
                            .addField("**Fletching**", lvlArr[10], true)
                            .addField("**Fishing**", lvlArr[11], true)
                            .addField("**Firemaking**", lvlArr[12], true)
                            .addField("**Crafting**", lvlArr[13], true)
                            .addField("**Smithing**", lvlArr[14], true)
                            .addField("**Mining**", lvlArr[15], true)
                            .addField("**Herblore**", lvlArr[16], true)
                            .addField("**Agility**", lvlArr[17], true)
                            .addField("**Thieving**", lvlArr[18], true)
                            .addField("**Slayer**", lvlArr[19], true)
                            .addField("**Farming**", lvlArr[20], true)
                            .addField("**Runecraft**", lvlArr[21], true)
                            .addField("**Hunter**", lvlArr[22], true)
                            .addField("**Construction**", lvlArr[23], true)
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