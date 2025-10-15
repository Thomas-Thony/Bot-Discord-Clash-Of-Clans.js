const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.user.setPresence({
      		activities: [
        		{
          			name: "Visual Studio Code",
        		},
      		],
      		status: "online", //il existe aussi :dnd (do not dister = ne pas déranger) , idle = inactif et invisible .
    	});

    console.log(`Connecté comme ${client.user.tag}`);
	},
};