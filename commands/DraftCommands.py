from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from discord import Message
from quart import jsonify
from utils.utils import *
from utils.config import *
from difflib import get_close_matches
from web_app import app
import os
from commands.ScoreBarCommands import score_bar_data
from mojang import MojangAPI
from re import findall
from json import load, dump
from pprint import pprint
from asyncio import TimeoutError

# Websockets Support
from utils.websockets import *
from quart import websocket


def save_draft_data():
    with open("draft_data.json", "w+") as f:
        json.dump(draft_data, f, indent=2)

draft_data = {}


if os.path.exists("draft_data.json"):
    with open("draft_data.json", "r") as f:
        draft_data = json.load(f)
else:
    save_draft_data()


class DraftCommands(Cog, QuartWebSocket, name="Roster Commands"):
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
                "draft_data": draft_data
            })
            while True:
                data = await queue.get()
                await websocket.send_json(data)

    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS)
    async def queue(self, ctx, leader, player):
        """
        Queue a pick to be covered by the stream when the stream operators do /draft_next
        """
        leader_uuid = MojangAPI.get_uuid(leader)
        player_uuid = MojangAPI.get_uuid(player)
        if not (leader_uuid and player_uuid):
            return await ctx.send("Could not find UUID for either the leader or the player")
        leader = MojangAPI.get_username(leader_uuid)  # get correct case from API
        player = MojangAPI.get_username(player_uuid)

        item = {
            "leader": leader,
            "player": player
        }
        
        if "queue" in draft_data.keys():
            draft_data["queue"].append(item)
        else:
            draft_data["queue"] = [item]

        print(draft_data)

        save_draft_data()

        return await success_embed(ctx, f"Added player `{player}` to team `{leader}`")


    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS)
    async def draft_next(self, ctx):
        """
        Progress the live stream on to the next pick, removing it from the queue
        """
        if not "queue" in draft_data.keys():
            return await error_embed(ctx, "There are not any queued picks yet. Please use /queue")
        if not draft_data["queue"]:
            return await error_embed(ctx, "The draft queue is empty. Use /queue to add a pick")
        
        pick = draft_data["queue"].pop(0)  # remove first item from queue
        
        if "teams" not in draft_data.keys():
            draft_data["teams"] = {}

        try:
            draft_data["teams"][pick["leader"]].append(pick["player"])
        except KeyError:
            draft_data["teams"][pick["leader"]] = [pick["player"]]

        draft_data["current_team"] = pick["leader"]

        draft_data["latest_pick"] = pick
        
        pprint(draft_data)

        save_draft_data()

        messages_sent = await self.broadcast(
            {
                "action_type": "update_draft_data",
                "draft_data": draft_data
            }
        )
        if messages_sent:
            await success_embed(ctx, f"Send new draft data to {messages_sent} clients\n\n")
        else:
            await error_embed(ctx, "No web clients connected")

    
    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS)
    async def draft_undo(self, ctx):
        """
        Remove the last item out of the draft queue
        """
        if not "queue" in draft_data.keys():
            return await error_embed(ctx, "There are not any queued picks yet. Please use /draft_queue")
        if not draft_data["queue"]:
            return await error_embed(ctx, "There is nothing to undo.")

        removed_pick = draft_data["queue"].pop()  # no arg = last item

        return await success_embed(
            ctx, 
            f"Removed player `{removed_pick['player']}` picked by `{removed_pick['leader']}` from the queue"
        )


    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS)
    async def cleardraft(self, ctx):
        """
        Removes any stored data for the draft overlays
        """
        await response_embed(ctx, "Are you sure?", "Please confirm that you'd like to clear the draft data (y/n)")

        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel

        try:
            response: Message = await self.bot.wait_for("message", check=check, timeout=60)
        except TimeoutError:
            return await error_embed(ctx, "Confirmation timed out")

        if response.content.lower() in ["yes", "y", "confirm", "ok"]:
            global draft_data
            draft_data = {}
            save_draft_data()
            return await success_embed(ctx, "Cleared draft data")
        else:
            return await response_embed(ctx, "Cancelled", "Cancelled clearing draft data")
