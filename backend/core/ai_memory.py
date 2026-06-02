import time

SESSIONS = {}

SESSION_TTL = 60 * 60 * 2  # 2 hours


# =========================
# CLEANUP EXPIRED SESSIONS
# =========================
def cleanup_sessions():
    now = time.time()
    expired = []

    for sid, data in SESSIONS.items():
        if now - data.get("created_at", now) > SESSION_TTL:
            expired.append(sid)

    for sid in expired:
        del SESSIONS[sid]


# =========================
# CREATE SESSION
# =========================
def create_session(session_id: str):
    cleanup_sessions()

    if session_id not in SESSIONS:
        SESSIONS[session_id] = {
            "created_at": time.time(),
            "disease": None,
            "confidence": None,
            "last_message": None,
            "history": [],
            "detection_history": [],
            "meta": {}
        }


# =========================
# UPDATE SESSION
# =========================
def update_session(session_id: str, key: str, value):
    create_session(session_id)
    SESSIONS[session_id][key] = value


# =========================
# ADD HISTORY
# =========================
def add_history(session_id: str, role: str, message: str):
    create_session(session_id)

    SESSIONS[session_id]["history"].append({
        "role": role,
        "message": message,
        "time": time.time()
    })

    SESSIONS[session_id]["last_message"] = message


# =========================
# GET SESSION
# =========================
def get_session(session_id: str):
    create_session(session_id)
    return SESSIONS[session_id]


# =========================
# SAVE DISEASE DETECTION
# =========================
def save_disease_detection(session_id: str, user_id: str, detection_result: dict):
    """Save disease detection result to memory"""
    create_session(session_id)
    
    detection_record = {
        "timestamp": time.time(),
        "user_id": user_id,
        "disease": detection_result.get("disease"),
        "confidence": detection_result.get("confidence"),
        "risk": detection_result.get("risk"),
        "top_matches": detection_result.get("top_matches", []),
        "advice": detection_result.get("advice", {}),
        "status": detection_result.get("status"),
        "message": detection_result.get("message")
    }
    
    SESSIONS[session_id]["detection_history"].append(detection_record)
    SESSIONS[session_id]["disease"] = detection_result.get("disease")
    SESSIONS[session_id]["confidence"] = detection_result.get("confidence")

# =========================
# GET DETECTION HISTORY
# =========================
def get_detection_history(session_id: str, limit: int = 10):
    """Get recent disease detection history"""
    create_session(session_id)
    history = SESSIONS[session_id].get("detection_history", [])
    return history[-limit:] if history else []

# =========================
# CLEAR SESSION
# =========================
def clear_session(session_id: str):
    if session_id in SESSIONS:
        del SESSIONS[session_id]