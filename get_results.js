const puppeteer = require("puppeteer");

let defaultName = "Flower, Sun, and Rain";
let gameName = (process.argv.length > 2) ? process.argv.slice(2).join(' ') : defaultName;

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
    "searchTerms": [
        `${gameQuery}`
    ],
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
    
    console.log(game);
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

getHLTBData(gameName).then((result) => console.log(result));