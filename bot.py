import discord
from discord.ext.commands import Bot
from discord_slash import SlashCommand
from discord_slash.utils import manage_commands
from utils.utils import *
from utils.config import *
import traceback

# Creating the bot object
intents = discord.Intents.all()
bot = Bot(command_prefix="?", intents=intents)
slash = SlashCommand(bot, sync_commands=SYNC_COMMANDS)

from commands.AdminCommands import AdminCommands
from commands.CardCommands import CardCommands
from commands.ScoreBarCommands import ScoreBarCommands
from commands.TitlePageCommands import TitlePageCommands
from commands.RosterCommands import RosterCommands
from commands.TeamWinCommands import TeamWinCommands
from commands.draftcmds import draftcmds


bot.add_cog(AdminCommands(bot, slash, bot_token))
bot.add_cog(CardCommands(bot))
bot.add_cog(ScoreBarCommands(bot))
bot.add_cog(TitlePageCommands(bot))
bot.add_cog(RosterCommands(bot))
bot.add_cog(TeamWinCommands(bot))
bot.add_cog(draftcmds(bot))


@bot.event
async def on_ready():
    print('Logged on as {0}!'.format(bot.user))
    save_json_file("utils/command_names.json", [command for command in slash.commands])


@bot.event
async def on_slash_command_error(ctx, error):
    print(''.join(traceback.format_exception(etype=type(error), value=error, tb=error.__traceback__)))
    if get_debug_status():
        desc = f"```{''.join(traceback.format_exception(etype=type(error), value=error, tb=error.__traceback__))}```"
        desc += f"_command executed by {ctx.author.mention}_"
        embed = discord.Embed(title=type(error).__name__, description=desc, colour=discord.Colour.red())
        await ctx.send(embed=embed)
    else:
        await error_embed(ctx, f"`{type(error).__name__}: {error}`")

bot.run(bot_token)
