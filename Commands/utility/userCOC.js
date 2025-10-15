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
    .setName("getjoueur")
    .setDescription("Affiche les statistiques d'un joueur Clash Of Clans")
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
    const joueurCOCEmbed = await getSommaireUtilisateurEmbed(tag);

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

async function getSommaireUtilisateur(unUtilisateur) {
  const utilisateur = await getUtilisateur(unUtilisateur);

  const sommaireListe = new Map();

  sommaireListe.set("Nom", utilisateur.name);
  sommaireListe.set("Tag", utilisateur.tag);
  sommaireListe.set("Niveau Hôtel de Ville", utilisateur.townHallLevel);
  sommaireListe.set("Niveau Expérience", utilisateur.expLevel);
  sommaireListe.set("Trophées", utilisateur.trophies);
  sommaireListe.set("Meilleur Trophées", utilisateur.bestTrophies);
  sommaireListe.set("Clan", utilisateur.clan ? utilisateur.clan.name : "Aucun");
  sommaireListe.set("Rôle Clan", utilisateur.role);
  sommaireListe.set("Donations", utilisateur.donations);
  sommaireListe.set("Reçus", utilisateur.donationsReceived);
  sommaireListe.set(
    "Niveau Builder Hall",
    utilisateur.builderHallLevel ?? "Aucun"
  );

  return sommaireListe; 
}


async function getSommaireUtilisateurEmbed(tag) {
  const unSommaireJoueur = await getSommaireUtilisateur(tag);

  const unNom = unSommaireJoueur.get("Nom")

  let description = "";
  unSommaireJoueur.forEach((value, key) => {
    description += `**${key}** : ${value}\n`;
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