## CMS Web Overlays
A web app designed to improve the quality of CMS streams.

Uses Bulma, Vue.js and anime.js to create web pages that are served by Quart, an an asyncio reimplementation of Flask. The web server runs in the same loop as a discord bot, which can be used to control the overlay and allows users to create popups.

## Installation

Make sure Python (v3.8) is installed on your system.

Clone the repository

    git clone https://github.com/TomD53/CMS-Web-Overlays/
    cd cms-web-overlays

Install the required python libraries

    pip install -r requirements.txt

Navigate to the static folder

    cd static

Install the various node modules

    npm install

Render the stylised CSS file

    npm run css-build

Create the file `utils/credentials.json` and enter the bot token from the Discord Developer Dashboard

    {
        "bot_token": "your_token_here"
    }

Edit the SLASH_COMMANDS_GUILDS list in `utils/config.py` and replace the ID with the guild ID of the server in which you intend to use slash commands