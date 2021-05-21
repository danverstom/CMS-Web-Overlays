from discord.ext.commands import Cog
from discord import Activity, ActivityType
from discord_slash.cog_ext import cog_slash, manage_commands
from quart import jsonify
from utils.utils import *
from utils.config import *
from difflib import get_close_matches
from web_app import app
import os
from commands.ScoreBarCommands import score_bar_data

# Websockets Support
from utils.websockets import *
from quart import websocket


class TitlePageCommands(Cog, QuartWebSocket, name="Score Bar Commands"):
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
        self.display_teams = False

        @app.websocket("/ws/starting_soon")
        @self.collect_websocket
        async def starting_soon_ws(queue):
            await websocket.send_json({
                "action_type": "connected",
                "ws_type": "starting_soon",
                "display_teams": self.display_teams
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)

    @cog_slash(name="toggleteams",
               description="Toggle the display of teams on the starting soon page",
               guild_ids=SLASH_COMMANDS_GUILDS)
    async def toggleteams(self, ctx):
        self.display_teams = not self.display_teams
        messages_sent = await self.broadcast(
            {
                "action_type": "toggle_teams_display",
                "display_teams": self.display_teams,
                "score_bar_data": score_bar_data
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Set team info display state to `{self.display_teams}` for `{messages_sent}` clients.")
        else:
            await error_embed(ctx, "No web clients connected")
    
    @cog_slash(name="countdown",
               description="Start a countdown on the starting soon page. ",
               guild_ids=SLASH_COMMANDS_GUILDS,
               options=[
                   manage_commands.create_option(
                       name="minutes", 
                       description="The timer duration in minutes. Default 5 minutes", 
                       option_type=4, 
                       required=False
                    )
               ])
    async def countdown(self, ctx, minutes: int = 5):
        messages_sent = await self.broadcast(
            {
                "action_type": "start_timer",
                "duration": minutes
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Sent {minutes} minute countdown command to `{messages_sent}` clients.")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(name="intervalmessage",
               description="Sets the status text for the interval page",
               guild_ids=SLASH_COMMANDS_GUILDS,
               options=[
                   manage_commands.create_option(
                       name="text", 
                       description="The text to display", 
                       option_type=3, 
                       required=True
                    )
               ])
    async def intervalmessage(self, ctx, text):
        messages_sent = await self.broadcast(
            {
                "action_type": "set_interval_text",
                "interval_text": text
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Sent new interval text to `{messages_sent}` clients.")
        else:
            await error_embed(ctx, "No web clients connected")