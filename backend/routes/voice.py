from fastapi import APIRouter, UploadFile, File, Depends
import tempfile
import os
import logging
from dotenv import load_dotenv
from main import verify_token

# =========================
# 🔐 ENV LOAD
# =========================
load_dotenv()

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-api")


# =========================
# 🎤 VOICE TO TEXT API
# =========================
@router.post("/voice-to-text")
async def voice_to_text(
    file: UploadFile = File(...),
    user: dict = Depends(verify_token)
):

    audio_path = None

    try:
        # =========================
        # 📦 SAVE TEMP AUDIO FILE
        # =========================
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await file.read())
            audio_path = tmp.name

        logger.info("Voice file received")

        # =========================
        # 🤖 OPENAI WHISPER (PRIMARY)
        # =========================
        text = None

        try:
            from openai import OpenAI

            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise Exception("OPENAI API KEY missing")

            client = OpenAI(api_key=api_key)

            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )

            text = transcript.text
            logger.info("Whisper transcription success")

        # =========================
        # 🔁 FALLBACK (NO API / ERROR)
        # =========================
        except Exception as e:
            logger.error("Whisper failed: %s", e)

            text = "Voice could not be processed clearly. Please try again or speak slowly."

        # =========================
        # 🧹 CLEANUP
        # =========================
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)

        return {
            "status": "success",
            "text": text,
            "language_hint": "auto"
        }

    except Exception as e:

        logger.error("Voice API error: %s", e)

        # safe cleanup
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)

        return {
            "status": "error",
            "message": str(e)
        }