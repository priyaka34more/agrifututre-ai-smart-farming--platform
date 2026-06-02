import requests

OLLAMA_URL = "http://localhost:11434/api/generate"


def ask_llm(prompt: str):
    try:
        res = requests.post(OLLAMA_URL, json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }, timeout=10)

        if res.status_code != 200:
            return None

        data = res.json()
        return data.get("response", "").strip()

    except Exception:
        return None