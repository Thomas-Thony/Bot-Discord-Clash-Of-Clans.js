require('dotenv').config();
const { Client } = require("clashofclans.js");
const COC_API_TOKEN = process.env.COC_API_TOKEN;
const ClientCOC = new Client({ keys: [COC_API_TOKEN]});

function getUtilisateur(unUtilisateur) {
  const requeteUtilisateur = ClientCOC.getPlayer(unUtilisateur);
  return requeteUtilisateur;
}

function getLienProfile(unUtilisateur) {
  const utilisateur = getUtilisateur(unUtilisateur);
  const profil = utilisateur.name;
  const tag = utilisateur.tag;
  const tagAmeliore = tag.substring(1);
  const lienProfilBis = `https://www.clashofstats.com/players/${profil}-${tagAmeliore}/summary`;
  return lienProfilBis;
}

function getSommaireUtilisateur(unUtilisateur) {
  const utilisateur = getUtilisateur(unUtilisateur);

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


function getSommaireUtilisateurEmbed(tag) {
  const unSommaireJoueur = getSommaireUtilisateur(tag);

  const unNom = unSommaireJoueur.get("Nom")

  let description = "";
  unSommaireJoueur.forEach((value, key) => {
    description += `**${key}** : ${value}\n`;
  });

  const embedJoueurCOC = new EmbedBuilder()
    .setColor("#71368A")
    .setTitle(`Le joueur ${unNom}`)
    .setURL(getLienProfile(tag))
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