from quart import websocket, render_template, Quart, jsonify
from secrets import token_urlsafe
from utils.websockets import *
from utils.config import *

app = Quart(__name__)
app.secret_key = token_urlsafe(32)


@app.websocket('/ws')
@collect_websocket
async def ws(queue):
    while True:
        data = await queue.get()
        await websocket.send_json(data)

@app.route("/overlay")
async def home():
    return await render_template("overlay.html")

@app.route("/broadcast")
async def broadcase_test():
    if not connected_websockets:
        return "no connected clients"
    print(connected_websockets)
    messages_sent = await broadcast({"action_type": "show_card", "card": "commentators", "duration": 1000})
    return f"broadcast worked ({messages_sent} messages sent)"


if __name__ == "__main__":
    app.run(WEB_SERVER_HOSTNAME, WEB_SERVER_PORT)