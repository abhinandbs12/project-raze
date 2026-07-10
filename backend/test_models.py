import os
import requests
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(r"C:\Users\abhin\Desktop\raze-engine", ".env"))
FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")

async def test():
    headers = {
        "Authorization": f"Bearer {FIREWORKS_API_KEY}"
    }
    async with httpx.AsyncClient() as client:
        res = await client.get("https://api.fireworks.ai/inference/v1/models", headers=headers, timeout=10)
        data = res.json()
        if "data" in data:
            print("Models available:")
            for m in data["data"][:15]:
                print(m["id"])
        else:
            print(data)

asyncio.run(test())
