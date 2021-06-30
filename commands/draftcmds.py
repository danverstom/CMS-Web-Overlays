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
    "teams": {"memes1": ["pilates", "mikye"], "mikye": ["memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1", "memes1"] },
    "current_leader": "mikye",
    "pickee": ""
}

class draftcmds(Cog, QuartWebSocket, name="draft Commands"):
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
        self.display_teams = False

        @app.websocket("/ws/draft")
        @self.collect_websocket
        async def draft_ws(queue):
            await websocket.send_json({
                "action_type": "connected",
                "ws_type": "draft",
                "roster_data": rosters
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)


    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[
        manage_commands.create_option(
            name="leader", 
            description="leaders name", 
            option_type=3, 
            required=True
        )
    ])
    async def _show(self, ctx, leader):
        """
        Show leader face (used right before they pick some1)
        """
        name = list(filter(lambda x: x.lower() == leader.lower(), rosters["teams"].keys()))
        if not name:
            return await error_embed(ctx, f"Could not find leader `{leader}`")
        name = name[0]
        #get caps ez
        rosters['current_leader'] = name
        messages_sent = await self.broadcast(
            {
                "action_type": "showLeaderData",
                "roster_data": rosters
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Showing {name}")
        else:
            await error_embed(ctx, "No web clients connected")


    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[
        manage_commands.create_option(
            name="leader", 
            description="leaders name", 
            option_type=3, 
            required=True
        )
    ])
    async def _roster(self, ctx, leader):
        """
        Show whole roster
        """
        name = list(filter(lambda x: x.lower() == leader.lower(), rosters["teams"].keys()))
        if not name:
            return await error_embed(ctx, f"Could not find leader `{leader}`")
        name = name[0]
        #get caps ez
        rosters['current_leader'] = name
        messages_sent = await self.broadcast(
            {
                "action_type": "showRosterData",
                "roster_data": rosters
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Showing {name}")
        else:
            await error_embed(ctx, "No web clients connected")


    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[
        manage_commands.create_option(
            name="leader", 
            description="leaders name", 
            option_type=3, 
            required=True
        ),
        manage_commands.create_option(
            name="player", 
            description="players name", 
            option_type=3, 
            required=True
        )
    ])
    async def _add(self, ctx, leader, player):
        """
        add player to roster team
        """
        name = list(filter(lambda x: x.lower() == leader.lower(), rosters["teams"].keys()))
        if not name:
            return await error_embed(ctx, f"Could not find leader `{leader}`")
        name = name[0]
        await ctx.send("Checking names with Mojang API...")
        uuid = MojangAPI.get_uuid(player)
        if not uuid:
            return await error_embed(ctx, f"Could not find minecraft account for IGN `{player}`")
        player = MojangAPI.get_username(uuid)
    
        rosters["teams"][f"{leader}"].append(player)
        rosters["pickee"] = player
        rosters["current_leader"] = name
        messages_sent = await self.broadcast(
            {
                "action_type": "addPlayerData",
                "roster_data": rosters,
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Leader {name} new addition: {player}")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS, options=[
        manage_commands.create_option(
            name="leader", 
            description="leaders name", 
            option_type=3, 
            required=True
        )
    ])
    async def _set(self, ctx, leader):
        """
        set leaders and their roster
        """
        name = list(filter(lambda x: x.lower() == leader.lower(), rosters["teams"].keys()))
        if not name:
            uuid = MojangAPI.get_uuid(leader)
            if not uuid:
                return await error_embed(ctx, f"Could not find minecraft account for IGN `{leader}`")
            player = MojangAPI.get_username(uuid)
            name = player
        else:
            name = name[0]
            
        
        await ctx.send(f"{name}'s team: enter roster, or `none` for no one")
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel

        response = await self.bot.wait_for('message', check=check)
        usernames = []

        if not response.content.lower() == 'none':
            usernames_input = findall("\w{3,16}", response.content)
            await response.reply("Checking names with Mojang API...")
            for names in usernames_input:
                uuid = MojangAPI.get_uuid(names)
                if not uuid:
                    await error_embed(ctx, f"Could not find minecraft account for IGN `{names}`")
                    return
                usernames.append(MojangAPI.get_username(uuid))

        rosters["teams"][f"{name}"] = usernames

        messages_sent = await self.broadcast(
            {
                "action_type": "setRosterData",
                "roster_data": rosters
            }
        )
        if messages_sent:
           await success_embed(
                ctx, 
                f"{name} set with roster to `{messages_sent}` clients\n\n```\n" + 
                "\n".join(usernames) + 
                "\n```"
            )
        else:
            await error_embed(ctx, "No web clients connected")
