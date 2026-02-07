import os
import asyncio
import edge_tts

os.makedirs("static/audio", exist_ok=True)

VOICE = "en-IN-NeerjaNeural"  
# Alternatives:
# en-IN-PrabhatNeural
# en-US-AriaNeural
# en-GB-LibbyNeural

async def _generate(text: str, output_path: str):
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_path)

def generate_voiceover(text: str, batch_id: str) -> str:
    output_path = f"static/audio/batch_{batch_id}.mp3"
    asyncio.run(_generate(text, output_path))
    return output_path
