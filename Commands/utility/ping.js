const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const pongEmbed = new EmbedBuilder()
  .setColor(0x0099ff)
  .setTitle("Ping Pong !")
  .setURL("https://discord.js.org/")
  .setAuthor({
    name: "Some name",
    iconURL: "https://i.imgur.com/AfFp7pu.png",
    url: "https://discord.js.org",
  })
  .setDescription("Pong !")
  .setThumbnail("https://i.imgur.com/AfFp7pu.png")

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder().setName('ping').setDescription('Envoie Pong ! '),
    async execute(interaction) {
        await interaction.deferReply();
        await new Promise((resolve) => setTimeout(resolve, 3000)); // simulation de traitement long
        await interaction.editReply({ content: "Pong !", embeds: [pongEmbed] });
    }
}