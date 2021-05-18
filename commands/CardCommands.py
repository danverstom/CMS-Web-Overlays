from discord.ext.commands import Cog
from discord_slash.cog_ext import cog_slash, manage_commands
from utils.utils import *
from utils.config import *
from utils.websockets import *


class CardCommands(Cog, name="Base Commands"):
    """
    This category contains commands which control on-screen notifications and cards
    """

    def __init__(self, bot):
        self.bot = bot

    @cog_slash(name="commentators", description="Shows commentators to viewers",
               options=[], guild_ids=SLASH_COMMANDS_GUILDS)
    async def commentators(self, ctx):
        await ctx.defer()
        messages_sent = await broadcast({"action_type": "show_card", "card": "commentators", "duration": 10000})
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
    async def commentators(self, ctx, title, description):
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
