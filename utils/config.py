import json
import logging

with open("utils/credentials.json") as file:
    credentials = json.load(file)

debug = False

def get_debug_status():
    return debug

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.INFO) #local time !

SLASH_COMMANDS_GUILDS = [753663184228974643]
bot_token = credentials["bot_token"]
SYNC_COMMANDS = True
ADMIN_ROLE = "Leader"

WEB_SERVER_HOSTNAME = "localhost"
WEB_SERVER_PORT = 8080