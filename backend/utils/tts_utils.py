# backend/utils/tts_utils.py
import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

load_dotenv()

os.makedirs("static/audio", exist_ok=True)

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
MODEL_ID = "eleven_multilingual_v2"

def generate_voiceover(text: str, batch_id: str) -> str:
    output_path = f"static/audio/batch_{batch_id}.mp3"

    audio_stream = client.text_to_speech.convert(
        text=text,
        voice_id=VOICE_ID,
        model_id=MODEL_ID,
        output_format="mp3_44100_128",
    )

    # ✅ WRITE STREAM PROPERLY
    with open(output_path, "wb") as f:
        for chunk in audio_stream:
            if chunk:
                f.write(chunk)

    print("🔊 ElevenLabs audio generated:", output_path)
    return output_path