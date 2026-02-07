import base64
import json
import os
import requests
from pathlib import Path
from dotenv import load_dotenv
from .prompt import FRESHNESS_PROMPT

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def analyze_freshness(image_path: Path) -> dict:
    response = None
    text = None

    image_bytes = image_path.read_bytes()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "model": "openrouter/auto",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": FRESHNESS_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_b64}"
                        },
                    },
                ],
            }
        ],
        "temperature": 0,
        "max_tokens": 300,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://traceroots.app",
        "X-Title": "TraceRoots",
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()

        return json.loads(text)

    except json.JSONDecodeError:
        return {
            "error": "invalid_json_from_llm",
            "raw_response": text,
        }

    except requests.RequestException as e:
        return {
            "error": "openrouter_request_failed",
            "message": str(e),
            "status_code": response.status_code if response else None,
            "raw_response": response.text if response else None,
        }

    except Exception as e:
        return {
            "error": "unexpected_error",
            "message": str(e),
        }