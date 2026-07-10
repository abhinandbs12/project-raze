import os
import requests
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(r"C:\Users\abhin\Desktop\raze-engine", ".env"))
FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")

async def test_model(model_id):
    headers = {
        "Authorization": f"Bearer {FIREWORKS_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 10
    }
    async with httpx.AsyncClient() as client:
        res = await client.post("https://api.fireworks.ai/inference/v1/chat/completions", headers=headers, json=payload, timeout=10)
        data = res.json()
        print(f"[{model_id}]: {res.status_code}")
        if res.status_code != 200:
            print(data)
        else:
            print("SUCCESS!")

async def main():
    models_to_test = [
        "llama-v3-8b-instruct",
        "accounts/fireworks/models/llama-v3-8b-instruct",
        "accounts/fireworks/models/llama-v3p1-8b-instruct",
        "accounts/fireworks/models/llama-v3p1-70b-instruct",
        "llama-v3p1-8b-instruct",
        "llama-v3.1-8b-instruct"
    ]
    for m in models_to_test:
        await test_model(m)

asyncio.run(main())
