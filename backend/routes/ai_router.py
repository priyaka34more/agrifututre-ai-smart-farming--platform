from fastapi import APIRouter
from pydantic import BaseModel

from utils.ai_controller import process_ai_request
from utils.advisory import get_advisory

router = APIRouter()


class AIRequest(BaseModel):
    session_id: str
    message: str
    lang: str = "en"
    disease: str = ""
    insights: dict = {}


_sessions = {}


def create_session(sid):
    if sid not in _sessions:
        _sessions[sid] = []


def add_history(sid, role, msg):
    _sessions.setdefault(sid, []).append({"role": role, "msg": msg})


def get_session(sid):
    return _sessions.get(sid, [])


@router.post("/ask")
def smart_ai(req: AIRequest):

    try:
        create_session(req.session_id)

        add_history(req.session_id, "user", req.message)

        advisory = get_advisory(req.disease)

        reply = process_ai_request(
            disease=req.disease,
            message=req.message,
            lang=req.lang,
            advisory=advisory,
            insights=req.insights
        )

        if not reply:
            reply = "🌾 Ask about medicine, fertilizer, prevention or weather."

        add_history(req.session_id, "bot", reply)

        return {
            "status": "success",
            "session_id": req.session_id,
            "reply": reply,
            "session": get_session(req.session_id)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }