const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require("puppeteer");
const { browserPath } = require('../../config.json');

let defaultName = "Flower, Sun, and Rain";


let browserProm = puppeteer.launch({ headless: false, args: ['--disable-gpu'], executablePath: browserPath});
console.log("Browser opened.");

const timeEmojis = new Map([
    ['time_00' , '1279923359488016404'],
    ['time_30' , '1279925576744042587'],
    ['time_40' , '1279925584553705583'],
    ['time_50' , '1279923349929070612'],
    ['time_60' , '1279924854862385293'],
    ['time_70' , '1279923338977873930'],
    ['time_80' , '1279923329213665320'],
    ['time_90' , '1279925156654878831'],
    ['time_100', '1279923313103077431']
]);

async function getHLTBData(gameQuery) {
    //Open up new HLTB page w/ given title
    let browser = await browserProm;
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36");
    await page.goto('https://howlongtobeat.com/?q=' + gameQuery);

    //Wait for page to update with search results
    await page.waitForSelector('.SearchOptions_search_title__83U9o'); 
    const searchResults = await page.$$('.GameCard_search_list__IuMbi');
    console.log(searchResults.length + " games found. Selecting first result.");

    if (searchResults.length == 0) {
	await page.close();
        return "No results";
    }
    else
        return await parseDetails(page, searchResults[0]);
}

async function parseDetails(page, result) {
    let details = {};

    details.gameTitle = await result.$eval('h2', el => el.textContent); // Game Title
    details.gameImage = await result.$eval('img', img => img.src.split('?')[0]); // Game Image
    details.timeStats = []; // Game Time Stats

    // Grabs the two separate columns creating a len-3 array of [Length Type, Avg Time, Completion confidence]
    let rawTimeStats = await result.$$eval('.GameCard_search_list_tidbit__0r_OP', els => els.map(el => [el.textContent, el.className.split(' ')[2]] ));
    for (let i = 0; i < rawTimeStats.length; i+=2)
        details.timeStats.push([rawTimeStats[i][0], rawTimeStats[i+1][0], rawTimeStats[i+1][1]]);

    await page.close();

    return details;
}

function buildEmbed(details) {
    let embed = new EmbedBuilder()
        .setTitle(details.gameTitle)
        .setThumbnail(details.gameImage)
        .setFooter({text: 'Created by @poochy'})
        .setColor(0x0C88AF);

    details.timeStats.forEach(el => {
        embed.addFields({ name: el[0], value: `<:${el[2]}:${timeEmojis.get(el[2])}> **${el[1]}**`});
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
