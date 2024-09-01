const puppeteer = require("puppeteer");

let defaultName = "Flower, Sun, and Rain";
let gameName = (process.argv.length > 2) ? process.argv.slice(2).join(' ') : defaultName;

async function getHLTBData(gameQuery) {
    let url = 'https://howlongtobeat.com/?q=' + gameQuery;
    let browser = await puppeteer.launch({ headless: false });
    //let details = await launchPage(browser, url);
    
    console.log(await launchPage(browser, url));
    await browser.close();
}

async function launchPage(browser, url) {
    //Open up new HLTB page w/ given title
    const page = await browser.newPage();
    await page.goto(url);

    //Wait for page to update with search results
    await page.waitForSelector('.SearchOptions_search_title__83U9o'); 
    const searchResults = await page.$$('.GameCard_search_list__IuMbi');
    console.log(searchResults.length + " games found. Selecting first result.");

    if (searchResults.length == 0)
        return "No results";
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
        details.timeStats.push([rawTimeStats[i], rawTimeStats[i+1][0], rawTimeStats[i+1][1]]);

    await page.close();

    return details;
}

getHLTBData(gameName);