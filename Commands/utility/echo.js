const { SlashCommandBuilder } = require("discord.js");
  
module.exports = {
  cooldown: 5,
  data : new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input!")
    .addStringOption((option) => option.setName('input').setDescription('The input to echo back').setRequired(true)
    )
  .addBooleanOption((option) =>
    option
      .setName("ephemeral")
      .setDescription("Whether or not the echo should be ephemeral")
  ),
  async execute(interaction) {
    //Réponse différée
    await interaction.deferReply();
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await interaction.editReply({ content: interaction.options.getString("input")});
  }
}