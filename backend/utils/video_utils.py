import os
from moviepy.video.VideoClip import ImageClip
from moviepy.video.compositing.CompositeVideoClip import concatenate_videoclips
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.audio.AudioClip import AudioClip, CompositeAudioClip

VIDEO_SIZE = (1280, 720)
AUDIO_FPS = 44100
TARGET_DURATION = 10.0

os.makedirs("static/generated_videos", exist_ok=True)

def generate_video(batch, audio_path: str) -> str:
    print("🎧 AUDIO PATH RECEIVED:", audio_path)
    print("📁 ABSOLUTE PATH:", os.path.abspath(audio_path))
    print("✅ AUDIO EXISTS:", os.path.exists(audio_path))

    image_paths = [
        "video_templates/farm.jpg",
        "video_templates/lab.jpg",
        "video_templates/blockchain.jpg",
        "video_templates/impact.jpg",
    ]

    # 1️⃣ Load narration
    narration = AudioFileClip(audio_path).with_fps(AUDIO_FPS)
    narration_duration = narration.duration

    # 2️⃣ Handle audio length
    if narration_duration < TARGET_DURATION:
        silence = AudioClip(
            lambda t: 0.0,
            duration=TARGET_DURATION - narration_duration,
            fps=AUDIO_FPS
        )

        audio = CompositeAudioClip([
            narration.with_start(0),
            silence.with_start(narration_duration)
        ])
    else:
        audio = narration.with_duration(TARGET_DURATION)

    audio = audio.with_duration(TARGET_DURATION)

    # 3️⃣ Build video from images
    scene_duration = TARGET_DURATION / len(image_paths)
    clips = []

    for img in image_paths:
        clips.append(
            ImageClip(img)
            .resized(VIDEO_SIZE)
            .with_duration(scene_duration)
        )

    video = concatenate_videoclips(
        clips,
        method="compose",
        padding=-0.2
    ).with_audio(audio)

    output_path = f"static/generated_videos/batch_{batch.batch_id}.mp4"

    video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        audio_fps=AUDIO_FPS,
        threads=4
    )

    return output_path
