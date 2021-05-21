from quart import render_template, Quart, jsonify
from secrets import token_urlsafe
from utils.config import *

app = Quart(__name__)
app.secret_key = token_urlsafe(32)


@app.route("/overlay")
async def overlay():
    return await render_template("overlay.html")

@app.route("/")
async def home():
    return await render_template("home.html")

@app.route("/starting_soon")
async def starting_soon():
    return await render_template("starting_soon.html")

@app.route("/interval")
async def interval():
    return await render_template("interval.html")


if __name__ == "__main__":
    app.run(WEB_SERVER_HOSTNAME, WEB_SERVER_PORT)