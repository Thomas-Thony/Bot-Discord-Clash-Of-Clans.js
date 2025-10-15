require('dotenv').config();
const { Client } = require("clashofclans.js");
const COC_API_TOKEN = process.env.COC_API_TOKEN;
const ClientCOC = new Client({ keys: [COC_API_TOKEN]});

const {
  EmbedBuilder,
  SlashCommandBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder() // Construction de la commande
    .setName("getjoueurstatscombat")
    .setDescription("Affiche les statistiques d'un joueur sur ses troupes, victoires, défaites, etc...")
    .addStringOption((option) =>
      option
        .setName("tag_utilisateur")
        .setDescription("Ajoute l'utilisateur à afficher")
        .setRequired(true)
    )
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    //Réponse différée
    await interaction.deferReply();

    //Requete API
    const tag = interaction.options.getString("tag_utilisateur");

    //Construction du message embarqué
    const joueurCOCEmbed = await getStatsCombatUtilisateurEmbed(tag);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await interaction.editReply({ embeds: [joueurCOCEmbed] });
  },
};

async function getUtilisateur(unUtilisateur) {
  const requeteUtilisateur = await ClientCOC.getPlayer(unUtilisateur);
  return requeteUtilisateur;
}

async function getLienProfile(unUtilisateur) {
  const utilisateur = getUtilisateur(unUtilisateur);
  const profil = (await utilisateur).name;
  const tag = (await utilisateur).tag;
  const tagAmeliore = tag.substring(1);
  const lienProfilBis = `https://www.clashofstats.com/players/${profil}-${tagAmeliore}/summary`;
  return lienProfilBis;
}

async function getStatsCombatUtilisateur(unUtilisateur) {
  const utilisateur = await getUtilisateur(unUtilisateur);

  const sommaireListeCombat = new Map();

  sommaireListeCombat.set("Guerre Étoiles", utilisateur.warStars);
  sommaireListeCombat.set("Attaques Gagnées", utilisateur.attackWins);
  sommaireListeCombat.set("Défenses Gagnées", utilisateur.defenseWins);
  sommaireListeCombat.set(
    "Ligue",
    utilisateur.league ? utilisateur.league.name : "Aucune"
  );
  sommaireListeCombat.set(
    "Trophées Builder",
    utilisateur.versusTrophies ?? "Aucun"
  );
  sommaireListeCombat.set(
    "Meilleur Trophées Builder",
    utilisateur.bestTrophies ?? "Aucun"
  );
  sommaireListeCombat.set(
    "Attaques Gagnées Builder",
    utilisateur.versusBattleWins ?? "Aucun"
  );

  let troupes = "";
  if (Array.isArray(utilisateur.homeTroops) && utilisateur.homeTroops.length) {
    utilisateur.homeTroops.forEach((item) => {
      troupes += `**${item.name}** : ${item.level}\n`;
    });
  } else {
    troupes = "Aucune";
  }
  sommaireListeCombat.set(`Troupes :\n`, troupes);

  let superTroupes = "";
  if (
    Array.isArray(utilisateur.superTroops) &&
    utilisateur.superTroops.length
  ) {
    utilisateur.superTroops.forEach((item) => {
      superTroupes += `**${item.name}** : ${item.level}\n`;
    });
  } else {
    superTroupes = "Aucune";
  }
  sommaireListeCombat.set(`Troupes2 :\n`, superTroupes);
  return sommaireListeCombat;
}

async function getStatsCombatUtilisateurEmbed(tag) {
  const unSommaireJoueur = await getStatsCombatUtilisateur(tag);
  const unNom = unSommaireJoueur.get("Nom");

  let description = "";
  unSommaireJoueur.forEach((index, item) => {
    description += `**${item}** : ${index}\n`;
  });

  const embedJoueurCOC = new EmbedBuilder()
    .setColor("#71368A")
    .setTitle(`Le joueur ${unNom}`)
    .setURL(await getLienProfile(tag))
    .setAuthor({
      name: "API Clash Of Clans",
      iconURL:
        "https://static.wikia.nocookie.net/logopedia/images/c/cc/Clash_of_Clans_%28App_Icon%29.png/revision/latest?cb=20220625115343g",
      url: "https://developer.clashofclans.com/#",
    })
    .setDescription(description)
    .setThumbnail(
      "https://static.wikia.nocookie.net/logopedia/images/c/cc/Clash_of_Clans_%28App_Icon%29.png/revision/latest?cb=20220625115343"
    );

  return embedJoueurCOC;
}