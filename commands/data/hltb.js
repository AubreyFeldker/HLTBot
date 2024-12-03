const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let defaultName = "Flower, Sun, and Rain";
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

async function getApiUrl() {
    const myHeaders = new Headers();
    myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const pattern1 = /chunks\/pages\/\_app-[a-z0-9]*/;
    const pattern2 = /\/search\/"\.concat\("[a-f0-9]*"\).concat\("[a-f0-9]*"\)/;

    return fetch("https://howlongtobeat.com/", requestOptions)
    .then((response) => response.text())
    .then((resText) => pattern1.exec(resText)[0].split('-')[1])
    .then(
        (chunk) => fetch(`https://howlongtobeat.com/_next/static/chunks/pages/_app-${chunk}.js`, requestOptions)
        .then((response) => response.text())
        .then((resText) => pattern2.exec(resText)[0])
        .then((pageLink) => apiURL = parseConcat(pageLink))
        .catch((error) => console.log(error))
    );
}

function parseConcat(extraction) {
    const splits = extraction.substring(12).split('"');
    console.log(splits);
    return splits[1] + splits[3];
}

async function getHLTBData(gameQuery, platform) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("origin", "https://howlongtobeat.com");
    myHeaders.append("priority", "u=1, i");
    myHeaders.append("referer", "https://howlongtobeat.com");
    myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"130\", \"Microsoft Edge\";v=\"130\", \"Not?A_Brand\";v=\"99\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0");

    const raw = JSON.stringify({
        "searchType": "games",
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
              "subGenre": " "
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

    return fetch(`https://howlongtobeat.com/api/search/${apiURL}`, requestOptions)
    .then((response) => response.text())
    .then((result) => extractDetails(JSON.parse(result)))
    .catch((error) => console.log(error));
}

async function extractDetails(result) {
    if(result.data.length === 0)
        return("No results");
    const game = result.data[0];

    let details = {};

    details.gameTitle = game['game_name']; // Game Title
    details.gameImage = `https://howlongtobeat.com/games/${game['game_image']}`; // Game Image
    details.timeStats = []; // Game Time Stats

    const comp_types = ["main", "plus", "100"];
    const comp_names = ["Main Story", "Main + Extra", "Completionist"]
    // Creating a len-3 array of [Length Type, Avg Time, Completion confidence]
    comp_types.forEach((type, index) => {
        if(game[`comp_${type}`] === 0)
            return;
        details.timeStats.push([comp_names[index], Math.round(game[`comp_${type}`] / 360) / 10.0, Math.min(Math.round(game[`comp_${type}_count`] * .4),10).toString()]);
    });

    return details;
}

function buildEmbed(details) {
    let embed = new EmbedBuilder()
        .setTitle(details.gameTitle)
        .setThumbnail(details.gameImage)
        .setFooter({text: 'Created by @poochy'})
        .setColor(0x0C88AF);

    details.timeStats.forEach(el => {
        embed.addFields({ name: el[0], value: `<:${el[2]}:${timeEmojis.get(el[2])}> **${el[1]} Hours**`});
    });

    return embed;
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
	async execute(interaction) {
        const gameName = interaction.options.getString('title');
        const platform = interaction.options.getString('platform') ?? '';
        await interaction.deferReply();
        if (apiURL == "") {
            await getApiUrl();
            console.log(`Search API URL updated to ${apiURL}`)
        }
        let details = await getHLTBData(gameName, platform);
        
        if(details == "No results")
            await interaction.followUp(`No results found for **${gameName}**.`);
        else
		    await interaction.followUp({embeds: [buildEmbed(details)]});
	},
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = platform_auto.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
        await interaction.respond(
            choices.map(choice => ({ name: choice, value: choice })),
        );
    },
};