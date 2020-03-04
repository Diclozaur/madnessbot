const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage } = require("../../functions.js");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kicks the member",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;

        if (message.deletable) message.delete();

        // No args
        if (!args[0]) {
            return message.reply("Te rog mentioneaza persoana pe care vrei sa o dai afara")
                .then(m => m.delete(5000));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Te rog sa dai un motiv pentru care il dai afara")
                .then(m => m.delete(5000));
        }

        // No author permissions
        if (!message.member.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ Nu ai permisiunea de a da afara aceasta persoana. Contacteaza un membru staff")
                .then(m => m.delete(5000));
        }

        // No bot permissions
        if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
            return message.reply("❌ Nu am permisiunea de a da afara acesta persoana. Contacteaza un membru staff")
                .then(m => m.delete(5000));
        }

        const toKick = message.mentions.members.first() || message.guild.members.get(args[0]);

        // No member found
        if (!toKick) {
            return message.reply("Nu am putut gasi un utilizator cu acest nume.")
                .then(m => m.delete(5000));
        }

        // Can't kick urself
        if (toKick.id === message.author.id) {
            return message.reply("Nu te poti da afara pe tine insuti")
                .then(m => m.delete(5000));
        }

        // Check if the user's kickable
        if (!toKick.kickable) {
            return message.reply("Acest utilizator nu poate fi dat afara")
                .then(m => m.delete(5000));
        }
                
        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setThumbnail(toKick.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Kicked member:** ${toKick} (${toKick.id})
            **> Kicked by:** ${message.member} (${message.member.id})
            **> Reason:** ${args.slice(1).join(" ")}`);

        const promptEmbed = new RichEmbed()
            .setColor("GREEN")
            .setAuthor(`Aceasta validare expira in 30 de secunde`)
            .setDescription(`Vrei sa il dai afara pe ${toKick}?`)

        // Send the message
        await message.channel.send(promptEmbed).then(async msg => {
            // Await the reactions and the reaction collector
            const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);

            // The verification stuffs
            if (emoji === "✅") {
                msg.delete();
                msg.channel.send(`${toKick} a fost dat afara cu succes!`);

                toKick.kick(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Kick-ul nu a functionat corect. Eroarea -> ${err}`)
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                msg.delete();

                message.reply(`Kick anulat`)
                    .then(m => m.delete(10000));
            }
        });
    }
};