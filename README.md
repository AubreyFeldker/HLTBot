HLTBot is a Discord Bot created by Aubrey Feldker for searching up completion lengths for various videogames. Information is queried from howlongtobeat.com, but this bot is not affliated with them.

# Usage

The `/hltb` command is the primary way of searching information. Provide the title of the game; the query is not case-sensitive, nor does it require the complete game title, but be careful of excluding symbols or spaces from a game's title.

![Image showing the importance of syntax matching](/assets/syntax-matching.png)

Less specific searches that match multiple game titles will return up to 20 results, which can be cycled through with the buttons under the response post. These responses are cached locally to the bot to ensure fast response times, but will be cleared after an hour.

# Querying from HowLongToBeat

HowLongToBeat frequently shuffles the API endpoint for searching, including wonderful paths such as `/api/ouch/78952b080bf5c22b`. The bot is designed to obtain the new search endpoint whenever the current one stops working, but the past few months have proven to be a cat and mouse game of new ways in which the current search endpoint is obfuscated.

A recent change at the time of writing is that old search endpoints return non-error payloads, but ones that don't contain the information the bot needs to work. Thankfully, these issues have been easily gotten around, but they still lead to some amount of bot downtime whenever it happens.
