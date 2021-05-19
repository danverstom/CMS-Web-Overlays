import asyncio
from functools import wraps

class QuartWebSocket:
    def __init__(self):
        self.connected_websockets = set()
    
    def collect_websocket(self, func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            queue = asyncio.Queue()
            self.connected_websockets.add(queue)
            try:
                return await func(queue, *args, **kwargs)
            finally:
                self.connected_websockets.remove(queue)
        return wrapper

    async def broadcast(self, message):
        messages_sent = 0
        for queue in self.connected_websockets:
            await queue.put(message)
            messages_sent += 1
        if not messages_sent:
            return False
        else:
            return messages_sent