from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from quart import jsonify
from utils.utils import *
from utils.config import *
from difflib import get_close_matches
from web_app import app
from os import listdir

# Websockets Support
from utils.websockets import *
from quart import websocket

team_win_data = {
    "team_logos": [
        "/static/assets/team_logos/fotia.png",
        "/static/assets/team_logos/delta_force.png"
    ],
    "primary_text": "Red Team defeats Blue Team",
    "secondary_text": "Map One"
}


class TeamWinCommands(Cog, QuartWebSocket, name="Team Win Commands"):
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
        self.display_teams = False

        @app.websocket("/ws/team_win")
        @self.collect_websocket
        async def team_win_ws(queue):
            await websocket.send_json({
                "action_type": "connected",
                "ws_type": "team_win",
                "team_win_data": team_win_data
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)

    @cog_slash(
        guild_ids=SLASH_COMMANDS_GUILDS,
        options=[
            manage_commands.create_option(
                name="primary_text",
                description="Set the large text for the team win screen",
                option_type=3,
                required=True
            ),
            manage_commands.create_option(
                name="secondary_text",
                description="Set the small text for the team win screen",
                option_type=3,
                required=True
            ),
            manage_commands.create_option(
                name="logo_searches",
                description="search for team logos, separated by commas e.g 'fotia, delta force'",
                option_type=3,
                required=False
            )
        ]
    )
    async def teamwin(self, ctx, primary_text, secondary_text, logo_searches=False):
        """
        Used to configure the 'team win' page
        """

        logo_filenames = listdir("static/assets/team_logos/")
        team_logos = []
        output = []

        if logo_searches:
            for search_term in logo_searches.split(","):
                matches = get_close_matches(
                    search_term.lower(), logo_filenames)
                if matches:
                    team_logos.append(f"static/assets/team_logos/{matches[0]}")
                    output.append(f"Found team logo `{matches[0]}` from search term `{search_term}`")
                else:
                    output.append( f"Could not find any team logos from search term `{search_term}`, skipping")

        team_win_data["primary_text"] = primary_text
        output.append(f"Set primary text to `{team_win_data['primary_text']}`")
        team_win_data["secondary_text"] = secondary_text
        output.append(f"Set secondary text to `{team_win_data['secondary_text']}`")

        team_win_data["team_logos"] = team_logos

        messages_sent = await self.broadcast(
            {
                "action_type": "update_team_win_data",
                "team_win_data": team_win_data
            }
        )
        if messages_sent:
            output.append(
                f"Sent new team win data data to `{messages_sent}` clients.")
        else:
            output.append("No web clients connected")
        await success_embed(ctx, "\n".join(output))
