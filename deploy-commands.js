require('dotenv').config();
const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require('discord.js');

//Importation des variables .env
const TOKEN = process.env.BOT_TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const APPLICATION_ID = process.env.APPLICATION_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Construction et préparation de l'instance du module REST
const rest = new REST().setToken(TOKEN);

//Déploiment des commandes 
(async () => {
	try {
		console.log(`Début rafraichissement des ${commands.length} commandes Slashs.`);
		const data = await rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), { body: commands });
		
		console.log(`Rechargement des ${data.length} (/) commandes fait avec succès !`);
		console.log('Commandes rafraîchies:');
		for (const cmd of data) {
			console.log(`- ${cmd.name}`);
		}
	} catch (error) {
		console.error(error);
	}
})();