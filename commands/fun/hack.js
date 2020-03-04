module.exports = {
    name: "hackme",
    category: "fun",
    description: "hack someone",
    run: async (client, message, args) => {
        const msg = await message.channel.send(`💩Hacking...`);

        msg.edit(`Succesfuly hacked ${message.member.displayName}`);
        message.channel.send(`#️⃣IP : 69.666.69.666 \n✅Port : 69666 \n🌎Location: Romania, Saracie \n🔰Adress: Strada Fantoma, Nr. 69`)
    }
}
        
