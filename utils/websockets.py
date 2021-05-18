import asyncio
from functools import wraps

connected_websockets = set()

def collect_websocket(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        global connected_websockets
        queue = asyncio.Queue()
        connected_websockets.add(queue)
        try:
            return await func(queue, *args, **kwargs)
        finally:
            connected_websockets.remove(queue)
    return wrapper

async def broadcast(message):
    messages_sent = 0
    for queue in connected_websockets:
        await queue.put(message)
        messages_sent += 1
    if not messages_sent:
        return False
    else:
        return messages_sent