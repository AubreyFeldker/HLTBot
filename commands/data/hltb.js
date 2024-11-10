const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

let defaultName = "Flower, Sun, and Rain";

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

async function getHLTBData(gameQuery) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("origin", "https://howlongtobeat.com");
    myHeaders.append("priority", "u=1, i");
    myHeaders.append("referer", "https://howlongtobeat.com/");
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
        "platform": "",
        "sortCategory": "popular",
        "rangeCategory": "main",
        "rangeTime": {
            "min": null,
            "max": null
        },
        "gameplay": {
            "perspective": "",
            "flow": "",
            "genre": ""
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

    return fetch("https://howlongtobeat.com/api/search/83b1e820d65038e8", requestOptions)
    .then((response) => response.text())
    .then((result) => extractDetails(JSON.parse(result)))
    .catch((error) => console.error(error));
}

async function extractDetails(result) {
    if(result.length === 0)
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
        ),
	async execute(interaction) {
        const gameName = interaction.options.getString('title');
        await interaction.deferReply();
        let details = await getHLTBData(gameName);
        
        if(details == "No results")
            await interaction.followUp(`No results found for **${gameName}**.`);
        else
		    await interaction.followUp({embeds: [buildEmbed(details)]});
	},
};
