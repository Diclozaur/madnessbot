const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage } = require("../../functions.js");

module.exports = {
    name: "ban",
    category: "moderation",
    description: "bans the member",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;

        if (message.deletable) message.delete();

        // No args
        if (!args[0]) {
            return message.reply("Da un motiv pentru care il banezi")
                .then(m => m.delete(5000));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Da un motiv pentru care il banezi")
                .then(m => m.delete(5000));
        }

        // No author permissions
        if (!message.member.hasPermission("BAN_MEMBERS")) {
            return message.reply("❌ Nu ai permisiunea de a bana. Te rog contacteaza un membru staff")
                .then(m => m.delete(5000));
        
        }
        // No bot permissions
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return message.reply("❌ Nu am permisiunea de a bana. Te rog contacteaza un membru staff")
                .then(m => m.delete(5000));
        }

        const toBan = message.mentions.members.first() || message.guild.members.get(args[0]);

        // No member found
        if (!toBan) {
            return message.reply("Nu am gasit niciun utilizator cu acest nume.")
                .then(m => m.delete(5000));
        }

        // Can't ban urself
        if (toBan.id === message.author.id) {
            return message.reply("Nu te poti bana pe tine insuti...!")
                .then(m => m.delete(5000));
        }

        // Check if the user's banable
        if (!toBan.bannable) {
            return message.reply("Acest utilizator nu poate fi banat")
                .then(m => m.delete(5000));
        }
        
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setThumbnail(toBan.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> baned member:** ${toBan} (${toBan.id})
            **> baned by:** ${message.member} (${message.member.id})
            **> Reason:** ${args.slice(1).join(" ")}`);

        const promptEmbed = new RichEmbed()
            .setColor("GREEN")
            .setAuthor(`Aceasta verificare devine invalida dupa 30 de secunde`)
            .setDescription(`Vrei sa il banezi pe ${toBan}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reactioncollector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // Verification stuffs
            if (emoji === "✅") {
                msg.delete();
                msg.channel.send(`${toBan} a fost banat cu succes!`);

                toBan.ban(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Ban-ul nu a functionat cum trebuie. Aceasta este eroarea -> ${err}`)
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                msg.delete();

                message.reply(`ban-ul a fost anulat`)
                    .then(m => m.delete(10000));
            }
        });
    }
};