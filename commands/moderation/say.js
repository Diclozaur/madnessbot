const { RichEmbed } = require("discord.js");

module.exports = {
    name: "say",
    aliases: ["bc", "broadcast"],
    category: "moderation",
    description: "Says your input via the bot",
    usage: "<input>",
    run: (client, message, args) => {
        message.delete();

        if (!message.member.hasPermission("MANAGE_MESSAGES"))
            return message.reply("Nu ai permisiunea de a executa aceasta comanda").then(m => m.delete(5000));

        if (args.length < 0)
            return message.reply("Nu ai nimic de spus?").then(m => m.delete(5000));

        const roleColor = message.guild.me.highestRole.hexColor;

        if (args[0].toLowerCase() === "embed") {
            const embed = new RichEmbed()
            .setDescription(args.slice(1).join(" "))
            .setColor(roleColor === "#000000" ? "#ffffff" :  roleColor)
            .setTimestamp()
            .setAuthor(message.author.username, message.author.displayAvatarURL);

            message.channel.send(embed);
        } else {
            message.channel.send(args.join(" "));
        }
    }
}
