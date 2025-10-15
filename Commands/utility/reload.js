const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);
		if (!command) {
			return interaction.reply(`Il n'existe pas de commande avec le nom de  \`${commandName}\`!`);
        }
        delete require.cache[require.resolve(`./${command.data.name}`)];
        try {
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`La commande ${newCommand.data.name} a été rechargée !`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur est survenue lors du rechargement de la commande : \`${commandName}\`.`, ephemeral: true });
        }
    },
};