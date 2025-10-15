require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  MessageFlags,
} = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Importation des variables .env
const TOKEN = process.env.BOT_TOKEN;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const APPLICATION_ID = process.env.APPLICATION_ID;
const GUILD_ID = process.env.GUILD_ID;

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
});

//Déclaration de la liste des commandes (Dossier + fichiers)
client.commands = new Collection();
const foldersPath = path.join(__dirname, "Commands");
const commandsFolders = fs.readdirSync(foldersPath);

//Parcours de la liste des fichiers du dossier
for (const folder of commandsFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[ATTENTION] La commande ${filePath} manque la propriété de données ou d'execute`
      );
    }
  }
}

//Interception d'éxécution de commande
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `Pas de commande du nom de ${interaction.commandName} trouvée.`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Il y a eu une erreur en exécutant cette commande !",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "Il y a eu une erreur en exécutant cette commande !",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // === Cooldown ===
  client.cooldown = new Collection();
  const { cooldown } = interaction.client;
  if (!cooldown.has(command.data.name)) {
    cooldown.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timeStamps = cooldown.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

  if (timeStamps.has(interaction.user.id)) {
    const expirationTime = timeStamps.get(interaction.user.id) + cooldownAmount;
    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1_000);
      return interaction.reply({
        content: `Veuillez patienter, vous êtes en cooldown pour \`${command.data.name}\`. Vous pouvez l'utiliser <t:${expiredTimestamp}:R>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  timeStamps.set(interaction.user.id, now);
  setTimeout(() => timeStamps.delete(interaction.user.id), cooldownAmount);
});

//Lecture du fichier ready.js
const eventsPath = path.join(__dirname, "Events");
const eventFile = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFile) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(TOKEN);