from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from quart import jsonify
from utils.utils import *
from utils.config import *
from difflib import get_close_matches
from web_app import app
import os
from commands.ScoreBarCommands import score_bar_data
from mojang import MojangAPI
from re import findall

# Websockets Support
from utils.websockets import *
from quart import websocket

rosters = {
    "red_roster": {
        "usernames": [
            "TomD53", "TomD53", "TomD53", "TomD53", "TomD53", "TomD53",
            "TomD53", "TomD53", "TomD53", "TomD53", "TomD53", "TomD53"
        ]
    },
    "blue_roster": {
        "usernames": [
            "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity",
            "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity", "Ninsanity"
        ]
    },
    "current_team": "red"
}

class RosterCommands(Cog, QuartWebSocket, name="Roster Commands"):
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
        self.display_teams = False

        @app.websocket("/ws/rosters")
        @self.collect_websocket
        async def rosters_ws(queue):
            await websocket.send_json({
                "action_type": "connected",
                "ws_type": "rosters",
                "roster_data": rosters
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)

    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[])
    async def nextroster(self, ctx):
        """
        Cycles to the next team roster
        """
        if rosters["current_team"] == "red":
            rosters["current_team"] = "blue"
        elif rosters["current_team"] == "blue":
            rosters["current_team"] = "red"
        messages_sent = await self.broadcast(
            {
                "action_type": "update_roster_data",
                "roster_data": rosters
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Changed displayed roster to {rosters['current_team']} team\nSent roster change instruction to `{messages_sent}` clients")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[
        manage_commands.create_option(
            name="team", 
            description="The team to set the roster for", 
            option_type=3, 
            required=True,
            choices=[
                manage_commands.create_choice("red", "red"),
                manage_commands.create_choice("blue", "blue"),
            ]
        )
    ])
    async def setroster(self, ctx, team):
        """
        Sets a roster for a certain team
        """
        team_name = score_bar_data["red_name"] if team == "red" else score_bar_data["blue_name"]
        await ctx.send(f"Please enter minecraft usernames for {team_name}")
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel

        response = await self.bot.wait_for('message', check=check)

        usernames_input = findall("\w{3,16}", response.content)
        usernames = []
        await response.reply("Checking names with Mojang API...")
        for name in usernames_input:
            uuid = MojangAPI.get_uuid(name)
            if not uuid:
                await error_embed(ctx, f"Could not find minecraft account for IGN `{name}`")
                return
            usernames.append(MojangAPI.get_username(uuid))


        rosters[f"{team}_roster"]["usernames"] = usernames

        messages_sent = await self.broadcast(
            {
                "action_type": "update_roster_data",
                "roster_data": rosters
            }
        )
        if messages_sent:
            await success_embed(
                ctx, 
                f"Sent new {team_name} roster to `{messages_sent}` clients\n\n```\n" + 
                "\n".join(usernames) + 
                "\n```"
            )
        else:
            await error_embed(ctx, "No web clients connected")
    
