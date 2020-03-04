const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
    warnThreshold: 4, // Amount of messages sent in a row that will cause a warning.
    kickThreshold: 10, // Amount of messages sent in a row that will cause a ban.
    banThreshold: 20, // Amount of messages sent in a row that will cause a ban.
    maxInterval: 2000, // Amount of time (in milliseconds) in which messages are considered spam.
    warnMessage: '{@user}, Ai primit un avertisment pentru ca ai spamat.', // Message that will be sent in chat upon warning a user.
    kickMessage: '**{user_tag}** a fost dat afara pentru spam', // Message that will be sent in chat upon kicking a user.
    banMessage: '**{user_tag}** a fost banat pentru spam', // Message that will be sent in chat upon banning a user.
    maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
    exemptPermissions: [ 'ADMINISTRATOR'], // Bypass users with any of these permissions.
    ignoreBots: true, // Ignore bot messages.
    verbose: true, // Extended Logs from module.
    ignoredUsers: [], // Array of User IDs that get ignored.
    // And many more options... See the documentation.
});


// Declares our bot,
// the disableEveryone prevents the client to ping @everyone
const client = new Client({
    disableEveryone: true
});

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

config({
    path: __dirname + "/.env"
});

// Run the command loader
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});


// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`${client.user.username} este online!`);

    // Set the user presence
    client.user.setPresence({
        status: "dnd",
        game: {
            name: "GO.MADNESS.RO",
            type: "WATCHING"
        }
    }); 
})


client.on("message", async message => {
    console.log(`${message.author.username} said: ${message.content}`);
});

client.on("message", async message => {
    const prefix = "=";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    // If message.member is uncached, cache it.
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    // Get the command
    let command = client.commands.get(cmd);
    // If none is found, try to find it by alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) 
        command.run(client, message, args);
});

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(channel => channel.name === '🎉welcome');
    if (!channel) return;
    channel.send(`Hey ${member}, bine ai venit pe **MADNESS ROMANIA**`);
  });

  client.on('guildMemberRemove', member => {
    const channel = member.guild.channels.find(channel => channel.name === '🎉welcome');
    if (!channel) return;
    channel.send(`${member} a iesit de pe **MADNESS ROMANIA**`);
  });

client.on ("guildMemberAdd", member => {

    var role = member.guild.roles.find ("name", "[🔰] Membru");
    member.addRole (role);
});

client.on('message', (message) => antiSpam.message(message)); 

client.login(process.env.TOKEN);