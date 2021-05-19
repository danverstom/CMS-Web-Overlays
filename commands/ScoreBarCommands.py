from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from quart import jsonify
from utils.utils import *
from utils.config import *
from difflib import get_close_matches
from web_app import app
import os

# Websockets Support
from utils.websockets import *
from quart import websocket

score_bar_data = {
    "text_items": SCORE_BAR_TEXT_ITEMS,
    "red_name": "Red Team",
    "red_score": 0,
    "red_logo": "",
    "blue_name": "Blue Team",
    "blue_score": 0,
    "blue_logo": ""
}


@app.route("/get_score_bar_data")
async def get_score_bar_data():
    return jsonify(score_bar_data)


class ScoreBarCommands(Cog, QuartWebSocket, name="Score Bar Commands"):
    """
    This category contains commands which control the team names and scores banner
    """

    def __init__(self, bot):
        super().__init__()
        self.bot = bot

        @app.websocket("/ws/scorebar")
        @self.collect_websocket
        async def scorebar_ws(queue):
            await websocket.send_json({
                "action_type": "connected"
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)

    @cog_slash(name="teams", description="Set up the teams for the score bar",
               guild_ids=SLASH_COMMANDS_GUILDS, options=[
                   manage_commands.create_option(
                       name="red_team",
                       description="The full team name of Red Team i.e 'Delta Force'",
                       option_type=3,
                       required=True
                   ),
                   manage_commands.create_option(
                       name="blue_team",
                       description="The full team name of Blue Team i.e 'Fotia'",
                       option_type=3,
                       required=True
                   )
               ])
    async def teams(self, ctx, red_team, blue_team):
        logo_filenames = os.listdir("static/assets/team_logos/")
        score_bar_data["red_name"] = red_team.title()
        score_bar_data["blue_name"] = blue_team.title()
        red_logo_url = ""
        blue_logo_url = ""
        red_logo_matches = get_close_matches(red_team.lower(), logo_filenames)
        blue_logo_matches = get_close_matches(blue_team.lower(), logo_filenames)
        logo_status_list = []
        if red_logo_matches:
            red_logo_url = f"static/assets/team_logos/{red_logo_matches[0]}"
            logo_status_list.append(f"Found logo {red_logo_matches[0]} for red team `{red_team.title()}`")
        if blue_logo_matches:
            blue_logo_url = f"static/assets/team_logos/{blue_logo_matches[0]}"
            logo_status_list.append(f"Found logo {blue_logo_matches[0]} for blue team `{blue_team.title()}`")
        score_bar_data["red_logo"] = red_logo_url
        score_bar_data["blue_logo"] = blue_logo_url
        messages_sent = await self.broadcast(
            {
                "action_type": "update_score_bar_data",
                "score_bar_data": score_bar_data
            }
        )
        await success_embed(ctx,f"Updated team names and logos\n\n"
                                + "\n".join(logo_status_list) if logo_status_list 
                                else f"No logos found for teams `{red_team}` and `{blue_team}`")
        if messages_sent:
            await success_embed(ctx, f"Sent next new score bar data to `{messages_sent}` clients.")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(name="scores", description="Set up the teams for the score bar",
               guild_ids=SLASH_COMMANDS_GUILDS, options=[
                   manage_commands.create_option(
                       name="red_score",
                       description="The current map score of Red Team",
                       option_type=4,
                       required=True
                   ),
                   manage_commands.create_option(
                       name="blue_score",
                       description="The current map score of Blue Team",
                       option_type=4,
                       required=True
                   )
               ])
    async def scores(self, ctx, red_score, blue_score):
        score_bar_data["red_score"] = red_score
        score_bar_data["blue_score"] = blue_score
        messages_sent = await self.broadcast(
            {
                "action_type": "update_score_bar_data",
                "score_bar_data": score_bar_data
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Sent next new score bar data to `{messages_sent}` clients.")
        else:
            await error_embed(ctx, "No web clients connected")