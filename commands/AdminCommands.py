from discord.ext.commands import Cog, has_role
from discord import File, Embed, Colour
import os
import sys
import platform
from utils.utils import *

# Slash commands support
from discord_slash.cog_ext import cog_slash, manage_commands
from utils.config import SLASH_COMMANDS_GUILDS, ADMIN_ROLE, WEB_SERVER_HOSTNAME, WEB_SERVER_PORT

# Web Server
from hypercorn.asyncio import serve
from hypercorn.config import Config
from asyncio import Event
from web_app import app
from logging import info

class AdminCommands(Cog, name="Admin Commands"):
    """
    These commands can be used by admins
    """

    def __init__(self, bot, slash, token):
        self.bot = bot
        self.slash = slash
        self.token = token
        self.web_task = None
        self.shutdown_event = Event()

    @Cog.listener()
    async def on_ready(self):
        config = Config()
        config.bind = [f"{WEB_SERVER_HOSTNAME}:{WEB_SERVER_PORT}"]
        self.web_task = self.bot.loop.create_task(serve(app, config=config, shutdown_trigger=self.shutdown_event.wait))

    @cog_slash(name="removecommands", description="Removes all slash commands from the bot",
               guild_ids=SLASH_COMMANDS_GUILDS)
    async def removecommands(self, ctx):
        if not has_permissions(ctx, ADMIN_ROLE):
            await ctx.send("You do not have sufficient permissions to perform this command", hidden=True)
            return False
        message = await response_embed(ctx, "Removing commands", "Please wait, this process can take a while")
        await manage_commands.remove_all_commands(self.bot.user.id, self.token, guild_ids=SLASH_COMMANDS_GUILDS)
        await message.delete()
        await success_embed(ctx, "Removed all commands from this bot")

    @cog_slash(name="restart", description="Restarts the bot",
               guild_ids=SLASH_COMMANDS_GUILDS,
               options=[manage_commands.create_option(name="remove_commands",
                                                      option_type=5,
                                                      description="if true, remove commands before restart",
                                                      required=False),
               manage_commands.create_option(name="pull_changes",
                                             option_type=5,
                                             description="if true, pull the latest changes from github",
                                             required=False)])
    async def restart(self, ctx, remove_commands=False, pull_changes=False):
        if not has_permissions(ctx, ADMIN_ROLE):
            await ctx.send("You do not have sufficient permissions to perform this command", hidden=True)
            return False
        msg = await ctx.send("`Bot is restarting`")
        if remove_commands:
            await msg.edit(content=msg.content + "\n`Removing commands - please wait, this process can take a while`")
            await manage_commands.remove_all_commands(self.bot.user.id, self.token, guild_ids=SLASH_COMMANDS_GUILDS)
            await msg.edit(content=msg.content + "\n`Removed all commands from the bot`")
        if pull_changes:
            await msg.edit(content=msg.content + "\n`Pulling latest changes`")
            output = subprocess.check_output("git pull", shell=True)
            await response_embed(ctx, "Update Summary", output.decode("utf8"))
        info("Triggering web server shutdown event")
        self.shutdown_event.set()
        info("Waiting for web server to shut down")
        await msg.edit(content=msg.content + "\n`Waiting for web server to shut down`")
        await self.web_task
        info("Web server shutdown complete")
        await msg.edit(content=msg.content + "\n`Web server shutdown complete. Bot restarting. Goodbye!`")
        info("Closing the bot")
        await self.bot.close()
        info("Bot has finished closing")

        # Checks for operating system
        operating_system = platform.system()
        if operating_system == "Windows":
            os.execv(sys.executable, ['python'] + sys.argv)
        elif operating_system == "Linux":
            os.execv(sys.executable, ['python3'] + sys.argv)
        else:
            await error_embed(ctx, "Bot is not running on Windows or Linux, failed to restart")
        quit()

    @cog_slash(guild_ids=SLASH_COMMANDS_GUILDS)
    async def debug(self, ctx):
        if not has_permissions(ctx, ADMIN_ROLE):
            await ctx.send("You do not have sufficient permissions to perform this command", hidden=True)
            return False
        if utils.config.debug:
            utils.config.debug = False
            await success_embed(ctx, "Toggled debug mode **off**")
        else:
            utils.config.debug = True
            await success_embed(ctx, "Toggled debug mode **on**")