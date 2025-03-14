const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.gameDetailsCache = {};


// Standard way of loading up commands
// from the command folder... even if this bot only
// has one command. Allows for expansion if necessary
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

// Anytime Discord sends an interaction request here, replies with this function
client.on(Events.InteractionCreate, async interaction => {
    // Someone clicks the back/next button, it edits the embed
    // with the data for a different game, same format
    if (interaction.isButton()) {
        const cachedGameDetails = client.gameDetailsCache[interaction.message.id];
        if (! cachedGameDetails)
            return await interaction.reply({ content: "The cache on this message has expired.", ephemeral: true});
        
        const gameNum = parseInt(interaction.customId);
        // Use the same build response method in hltb.js to re-create the response message
        await interaction.update(client.commands.get('hltb').buildResponse(cachedGameDetails, gameNum));
    }

    // All other interactions die on the spot
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

    if (interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction);
        }
        catch (error) {
            console.error(error);
        }
    }
    // Must be the original slash command then!
    else {
        try {
            await command.execute(client, interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                // This shouldn't appear now unless HLTB massively changes how their endpoints work again
                await interaction.followUp({ content: 'Reloading connection to HLTB... try again in a minute.', ephemeral: true });
                process.exit(0);
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
});