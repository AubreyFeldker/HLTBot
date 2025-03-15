const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// HLTB search enpoint URL
let apiURL = "";

const timeEmojis = new Map([
    ['0' , '1279923359488016404'],
    ['1' , '1279925576744042587'],
    ['2' , '1279925576744042587'],
    ['3' , '1279925576744042587'],
    ['4' , '1279925584553705583'],
    ['5' , '1279923349929070612'],
    ['6' , '1279924854862385293'],
    ['7' , '1279923338977873930'],
    ['8' , '1279923329213665320'],
    ['9' , '1279925156654878831'],
    ['10', '1279923313103077431']
]);

const platform_auto = [
    '3DO',
    'Acorn Archimedes',
    'Amazon Luna',
    'Amiga',
    'Amiga CD32',
    'Amstrad CPC',
    'Apple II',
    'Arcade',
    'Atari 2600',
    'Atari 5200',
    'Atari 7800',
    'Atari 8-bit Family',
    'Atari Jaguar',
    'Atari Jaguar CD',
    'Atari Lynx',
    'Atari ST',
    'BBC Micro',
    'Browser',
    'ColecoVision',
    'Commodore 64',
    'Commodore PET',
    'Commodore VIC-20',
    'Dreamcast',
    'Evercade',
    'FM Towns',
    'FM-7',
    'Game & Watch',
    'Game Boy',
    'Game Boy Advance',
    'Game Boy Color',
    'Gear VR',
    'Gizmondo',
    'Google Stadia',
    'Intellivision',
    'Interactive Movie',
    'Linux',
    'Mac',
    'Meta Quest',
    'Mobile',
    'MSX',
    'N-Gage',
    'NEC PC-88',
    'NEC PC-98',
    'NEC PC-FX',
    'Neo Geo',
    'Neo Geo CD',
    'Neo Geo Pocket',
    'NES',
    'Nintendo 3DS',
    'Nintendo 64',
    'Nintendo DS',
    'Nintendo GameCube',
    'Nintendo Switch',
    'Oculus Go',
    'Odyssey',
    'Odyssey 2',
    'OnLive',
    'Ouya',
    'PC',
    'Philips CD-i',
    'Playdate',
    'PlayStation',
    'PlayStation 2',
    'PlayStation 3',
    'PlayStation 4',
    'PlayStation 5',
    'PlayStation Mobile',
    'PlayStation Portable',
    'PlayStation Vita',
    'Plug & Play',
    'Sega 32X',
    'Sega CD',
    'Sega Game Gear',
    'Sega Master System',
    'Sega Mega Drive/Genesis',
    'Sega Pico',
    'Sega Saturn',
    'SG-1000',
    'Sharp X1',
    'Sharp X68000',
    'Super Nintendo',
    'Tiger Handheld',
    'TurboGrafx-16',
    'TurboGrafx-CD',
    'Vectrex',
    'Virtual Boy',
    'Wii',
    'Wii U',
    'Windows Phone',
    'WonderSwan',
    'Xbox',
    'Xbox 360',
    'Xbox One',
    'Xbox Series X/S',
    'ZeeboZ',
    'X Spectrum',
    'ZX81'
];

//Get the current API search endpoint from https://howlongtobeat.com.
//The website shuffles its endpoints every few days, so automatically
//finding the current one is necessary
async function getApiUrl() {
    const myHeaders = new Headers();
    // Fetch most current user agent from this github link
    myHeaders.append("user-agent", (await fetch("https://jnrbsn.github.io/user-agents/user-agents.json", {method: 'GET'})).text());

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    //Regex patterns for grabbing endpoints from responses
    const pattern1 = /chunks\/pages\/\_app-[a-z0-9]*/;
    const pattern2 = /"[a-z\/]+"\.concat\("[a-f0-9]*"\).concat\("[a-f0-9]*"\)/;

    //Fetch from the main HLTB domain
    return fetch("https://howlongtobeat.com/", requestOptions)
    .then((response) => response.text())
    //Regex pattern gets the first endpoint hexadecimal string
    .then((resText) => pattern1.exec(resText)[0].split('-')[1])
    .then(
        // Fetch the text of the js file, then use the second regex pattern
        // to get the search endpoint from there. Format usually
        // api/[someword]/[hexstring]
        (chunk) => fetch(`https://howlongtobeat.com/_next/static/chunks/pages/_app-${chunk}.js`, requestOptions)
        .then((response) => response.text())
        .then((resText) => pattern2.exec(resText)[0])
        .then((pageLink) => apiURL = parseConcat(pageLink))
        .catch((error) => console.log(error))
    );
}

function parseConcat(extraction) {
    const splits = extraction.split('"');
    console.log('The splits: ' + extraction);
    return splits[1] + splits[3] + splits[5];
}

async function getHLTBData(gameQuery, platform) {
    // Building the standard HLTB search query
    // grabbed from the website
    const myHeaders = new Headers();
    myHeaders.append("content-type", "application/json");
    myHeaders.append("referer", "https://howlongtobeat.com/");
    myHeaders.append("user-agent", (await fetch("https://jnrbsn.github.io/user-agents/user-agents.json", {method: 'GET'})).text());


    const raw = JSON.stringify({
    "searchType": "games",
    // Resolves searching both a single string and
    // a list, but the list seems to offer more precise results
    "searchTerms": gameQuery.split(" "),
    "searchPage": 1,
    "size": 20,
    "searchOptions": {
        "games": {
        "userId": 0,
        "platform": platform,
        "sortCategory": "popular",
        "rangeCategory": "main",
        "rangeTime": {
            "min": null,
            "max": null
        },
        "gameplay": {
            "perspective": "",
            "flow": "",
            "genre": "",
            "difficulty": ""
        },
        "rangeYear": {
            "min": "",
            "max": ""
        },
        "modifier": ""
        },
        "users": {
        "sortCategory": "postcount"
        },
        "lists": {
        "sortCategory": "follows"
        },
        "filter": "",
        "sort": 0,
        "randomizer": 0
    },
    "useCache": true
    });

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    // Return an object containing a list of all the matched games
    return fetch(`https://howlongtobeat.com/${apiURL}`, requestOptions)
    .then((response) => response.text());
}

// Using HLTB response, create a list of each game
async function extractDetails(result) {
    if(result.data.length === 0)
        return("No results");
    const games = result.data;

    const detailsList = [];

    games.forEach((game) => {
        let details = {};
        details.gameTitle = game['game_name']; // Game Title
        details.gameImage = `https://howlongtobeat.com/games/${game['game_image']}`; // Game Image
        details.timeStats = []; // Game Time Stats

        const comp_types = ["main", "plus", "100"];
        const comp_names = ["Main Story", "Main + Extra", "Completionist"]
        // Creating a len-3 array of [Length Type, Avg Time, Completion confidence]
        comp_types.forEach((type, index) => {
            // Outdated search endpoints have started to give out incomplete
            // data (no completion times), so throw error to force resetting endpoint
            if(!game[`comp_${type}`]) 
                throw "No comp types detected. Outdated endpoint";
            if(game[`comp_${type}`] === 0)
                return;
            
            details.timeStats.push([comp_names[index], 
                // Convert the times from tenths of seconds(???) to hours
                Math.round(game[`comp_${type}`] / 360) / 10.0,
                // I couldn't figure out HLTB's math for mapping player counts to
                // the confidence colors, so I just did it on a (x / 25) fraction of
                // submissions, which vaguely lines up
                Math.min(Math.round(game[`comp_${type}_count`] * .4),10).toString()]);
        });
        detailsList.push(details);
    })

    return detailsList;
}

// Create Discord.js embed object based on the details list
function buildResponse(detailsList, detailNum) {
    const details = detailsList[detailNum];
    const reactButtonRows = [new ActionRowBuilder()];

    let embed = new EmbedBuilder()
        .setTitle(details.gameTitle)
        .setThumbnail(details.gameImage)
        .setFooter({text: 'Bot created by @poochy'})
        .setColor(0x0C88AF);

    // Each row formatted as:
    // Completion type
    // [confidence emote] Completion time
    details.timeStats.forEach(el => {
        embed.addFields({ name: el[0], value: `<:${el[2]}:${timeEmojis.get(el[2])}> **${el[1]} Hours**`});
    });

    // If multiple game results and this is the 2nd result,
    // add a back button
    if(detailNum > 0) {
        const next = new ButtonBuilder()
            .setCustomId(`${detailNum-1}`)
            .setLabel('←')
            .setStyle(ButtonStyle.Secondary);
        reactButtonRows[0].addComponents(next);
    }
    // If multiple game results and this is not the
    // last result, add a next button
    if(detailNum < detailsList.length - 1) {
        const next = new ButtonBuilder()
            .setCustomId(`${detailNum+1}`)
            .setLabel('→')
            .setStyle(ButtonStyle.Secondary);
        reactButtonRows[0].addComponents(next);
    }
    const post = {embeds: [embed], fetchReply: true};
    //Only add the reaction row if there is buttons to include
    //i.e. more than one game result
    if (reactButtonRows[0].components.length > 0) { post.components = reactButtonRows; }

    return post;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hltb')
		.setDescription('Get data on game lengths from HowLongToBeat.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('What game are you looking for? Precise syntax required.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Platform you want to search for')
                .setAutocomplete(true)
        ),
	async execute(client, interaction) {
        const gameName = interaction.options.getString('title');
        const platform = interaction.options.getString('platform') ?? '';
        let response, details, followUpMsgID;
        
        await interaction.deferReply();

        try {
            response = await getHLTBData(gameName, platform);
            details = await extractDetails(JSON.parse(response));
        }
        // This will trigger if the search endpoint responds
        // with an error (out of date API), so just need to
        // grab the new one
        catch(e) {
            console.log(e);

            await getApiUrl();
            console.log(`Search API URL updated to ${apiURL}`);
            response = await getHLTBData(gameName, platform);
            details = await extractDetails(JSON.parse(response));
        }
        finally {
            if(details == "No results")
                return await interaction.followUp(`No results found for **${gameName}**.`);
                  
            followUpMsgID = (await interaction.followUp(buildResponse(details, 0))).id;
            if(details.length == 1)
                return;

            // If multiple results for games, keep them in a collection
            // so that they can be found without sending another HTML request
            client.gameDetailsCache[followUpMsgID] = details;
            // Delete collection after an hour to prevent memory buildup. The
            // chance of anyone actually trying to click on one of these after an hour
            // is essentially zero
            setTimeout(() => delete client.gameDetailsCache[followUpMsgID], 3600000);

        }
	},
    //When someone types in a console during their interaction
    //on discord, it automatically calls this method to get the autocomplete
    //responses, since HLTB's query requires specific syntax.
    // Very standard startsWith non-case sensitive matching
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        let choices = platform_auto.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
        choices.length = Math.min(choices.length, 25);
        await interaction.respond(
            choices.map(choice => ({ name: choice, value: choice })),
        );
    },
    buildResponse(details, num) { return buildResponse(details, num); },
};