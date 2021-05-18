from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from utils.utils import *
from utils.config import *
from utils.websockets import *
from difflib import get_close_matches
from mojang import MojangAPI
import os


class CardCommands(Cog, name="Base Commands"):
    """
    This category contains commands which control on-screen notifications and cards
    """

    def __init__(self, bot):
        self.bot = bot

    @cog_slash(name="commentators", description="Shows commentators to viewers",
               options=[manage_commands.create_option(
                   name="usernames",
                   description="Minecraft usernames of the commentators, separated by commas",
                   option_type=3,
                   required=True
               )], guild_ids=SLASH_COMMANDS_GUILDS)
    async def commentators(self, ctx, usernames):
        await ctx.defer()
        usernames_list = usernames.strip().split(",")
        if not usernames_list:
            await error_embed(ctx, "Please input commentator minecraft usernames separated by commas, such as `Ninsanity, TomD53`")
            return
        for name in usernames_list:
            uuid = MojangAPI.get_uuid(name)
            if not uuid:
                await error_embed(ctx, f"Could not find minecraft account for IGN `{name}`")
                return
        messages_sent = await broadcast(
            {"action_type": "show_card",
            "card": "commentators", 
            "duration": 10000,
            "commentators": usernames_list}
        )
        if messages_sent:
            await success_embed(ctx, f"Sent commentator card instruction to `{messages_sent}` clients")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(name="notification", description="Show a notification message to users",
               options=[manage_commands.create_option(
                   name="title",
                   description="The title at the top of the notification card",
                   option_type=3,
                   required=True
               ),
                   manage_commands.create_option(
                   name="description",
                   description="The text content of the notification",
                   option_type=3,
                   required=True
               )], guild_ids=SLASH_COMMANDS_GUILDS)
    async def notification(self, ctx, title, description):
        await ctx.defer()
        messages_sent = await broadcast({
            "action_type": "show_card",
            "card": "notification",
            "duration": 10000,
            "title": title,
            "description": description})
        if messages_sent:
            await success_embed(ctx,
                                f"Sent notification card instruction to `{messages_sent}` clients."
                                f"\n**Title:** {title}\n**Description:** {description}")
        else:
            await error_embed(ctx, "No web clients connected")

    @cog_slash(name="nextmap", description="Show a next map notification to viewers",
               options=[manage_commands.create_option(
                   name="map_name_search",
                   description="The name of the map you would like to display",
                   option_type=3,
                   required=True
               )], guild_ids=SLASH_COMMANDS_GUILDS)
    async def nextmap(self, ctx, map_name_search):
        await ctx.defer()
        with open("utils/maps.json") as file:
            maps = load(file)

        map_names = maps.keys()
        matches = get_close_matches(map_name_search, map_names)
        if not matches:
            await error_embed(ctx, f"Could not find any rotation maps with the search term `{map_name_search}`")
            return
        map_name = matches[0]
        map_id = maps[map_name]
        if not os.path.isfile(f"static/assets/map_previews/{map_id}.jpg"):
            await error_embed(ctx, f"No preview image available for map `{map_name}`")
            return
        messages_sent = await broadcast(
            {
                "action_type": "show_card",
                "card": "next_map",
                "duration": 10000,
                "title": "Next Map",
                "description": f"The next map will be {map_name}",
                "map_id": map_id
            }
        )
        if messages_sent:
            await success_embed(ctx,
                                f"Sent next map card instruction to `{messages_sent}` clients."
                                f"\n**Map Name:** {map_name}\n**Map ID:** {map_id}")
        else:
            await error_embed(ctx, "No web clients connected")
