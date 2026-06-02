import os
import sys
import json
import uuid
import time
import logging
import importlib
import sqlite3
import runpy
import numpy as np

from collections import defaultdict
from logging.handlers import TimedRotatingFileHandler

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = lambda *args, **kwargs: None

from fastapi import (
    FastAPI,
    Request,
    HTTPException,
    Header,
    UploadFile,
    File,
    Form
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse

from fastapi.exceptions import RequestValidationError

from starlette.exceptions import (
    HTTPException as StarletteHTTPException
)

# =========================================================
# 🌱 ADVISORY IMPORT
# =========================================================

from database.db_helper import get_advisory

# =========================================================
# 🌱 PYTORCH IMPORTS
# =========================================================

import torch
import torch.nn as nn

from torchvision import (
    transforms,
    models
)

# =========================================================
# 🔐 ENV LOAD
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)

if hasattr(sys.stdout, "reconfigure"):

    try:

        sys.stdout.reconfigure(
            encoding="utf-8",
            errors="replace"
        )

    except:
        pass

APP_VERSION = os.getenv(
    "APP_VERSION",
    "6.0.0"
)

# =========================================================
# 📂 MODEL PATHS
# =========================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "best_crop_disease_model.pth"
)

CLASS_PATH = os.path.join(
    BASE_DIR,
    "models",
    "class_names.json"
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

LOG_DIR = os.path.join(
    BASE_DIR,
    "logs"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    LOG_DIR,
    exist_ok=True
)

# =========================================================
# 🧠 SAFE JSON RESPONSE
# =========================================================

class SafeJSONResponse(JSONResponse):

    def render(self, content) -> bytes:

        def clean_nan(obj):

            if isinstance(obj, dict):

                return {
                    k: clean_nan(v)
                    for k, v in obj.items()
                }

            elif isinstance(obj, list):

                return [
                    clean_nan(item)
                    for item in obj
                ]

            elif isinstance(obj, float):

                if np.isnan(obj) or np.isinf(obj):

                    return 0.0

                return obj

            elif isinstance(obj, np.ndarray):

                return clean_nan(
                    obj.tolist()
                )

            return obj

        cleaned_content = clean_nan(content)

        return json.dumps(
            cleaned_content,
            ensure_ascii=False,
            allow_nan=False,
            separators=(",", ":")
        ).encode("utf-8")

# =========================================================
# 🪵 LOGGING
# =========================================================

class SafeTimedRotatingFileHandler(TimedRotatingFileHandler):
    def doRollover(self):
        try:
            super().doRollover()
        except (PermissionError, OSError):
            # Suppress rollover errors on Windows (e.g. during uvicorn reload)
            pass

log_formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

console_handler = logging.StreamHandler()

console_handler.setFormatter(
    log_formatter
)

file_handler = SafeTimedRotatingFileHandler(
    os.path.join(
        LOG_DIR,
        "agrifuture.log"
    ),
    when="midnight",
    interval=1,
    backupCount=7,
    encoding="utf-8",
)

file_handler.setFormatter(
    log_formatter
)

logging.basicConfig(
    level=logging.INFO,
    handlers=[
        console_handler,
        file_handler
    ]
)

logger = logging.getLogger(
    "AgriFuture"
)

# =========================================================
# 🚀 FASTAPI INIT
# =========================================================

app = FastAPI(

    title="AgriFuture AI API",

    description=
    "AI-powered Smart Farming Platform",

    version=APP_VERSION,

    docs_url="/docs",

    redoc_url="/redoc",

    openapi_url="/openapi.json",

    default_response_class=
    SafeJSONResponse
)

# =========================================================
# 🌐 CORS
# =========================================================

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.56.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "capacitor://localhost",
    "http://192.168.1.5:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# 📊 RATE LIMITER
# =========================================================

request_counts = defaultdict(

    lambda: {

        "count": 0,

        "last_reset": time.time()
    }
)

RATE_LIMIT = 60

RESET_INTERVAL = 60

@app.middleware("http")
async def rate_limit_middleware(
    request: Request,
    call_next
):

    client_ip = request.client.host

    current_time = time.time()

    p = request.url.path

    # =====================================================
    # SKIP DOCS
    # =====================================================

    if p in (
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json"
    ) or p.startswith("/docs"):

        return await call_next(request)

    user_data = request_counts[client_ip]

    if current_time - user_data["last_reset"] > RESET_INTERVAL:

        user_data["count"] = 1

        user_data["last_reset"] = current_time

    else:

        user_data["count"] += 1

    if user_data["count"] > RATE_LIMIT:

        return JSONResponse(

            status_code=429,

            content={

                "status": "error",

                "message":
                "Too many requests"
            }
        )

    return await call_next(request)

# =========================================================
# 📊 REQUEST LOGGER
# =========================================================

@app.middleware("http")
async def add_request_id_and_log(
    request: Request,
    call_next
):

    request_id = str(uuid.uuid4())

    request.state.request_id = request_id

    start_time = time.time()

    try:

        response = await call_next(request)

    except Exception as e:

        logger.error(
            "[%s] Request crash: %s",
            request_id,
            e,
            exc_info=True
        )

        return JSONResponse(

            status_code=500,

            content={

                "status": "error",

                "message":
                "Internal server error",

                "request_id":
                request_id
            }
        )

    duration = round(
        time.time() - start_time,
        3
    )

    response.headers[
        "X-Request-ID"
    ] = request_id

    logger.info(
        "[%s] %s %s Status: %s Time: %ss",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )

    return response

# =========================================================
# 🛡️ JWT AUTH
# =========================================================

from utils.auth_utils import decode_token

async def verify_token(
    authorization: str = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail=
            "Missing authorization header"
        )

    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Invalid token format"
        )

    token = authorization.split(" ")[1]

    payload = decode_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail=
            "Invalid or expired token"
        )

    return payload

async def verify_token_optional(
    authorization: str = Header(None)
):
    if not authorization:
        return None

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)

    return payload

# =========================================================
# 🗄️ DATABASE INIT
# =========================================================

db_status = "not_initialized"

try:

    from database import (
        Base,
        engine
    )

    from models.history_model import (
        DetectionHistory
    )

    from models.user_model import User
    from models.yield_prediction_model import YieldPrediction
    from models.market_forecast_model import MarketForecast
    from models.govt_scheme_activity_model import GovtSchemeActivity
    from models.activity_model import UserActivity
    from models.farmer_query_model import FarmerQuery
    from models.advisory_knowledge_model import AdvisoryKnowledge

    Base.metadata.create_all(
        bind=engine
    )

    db_status = "connected"

    logger.info(
        "Database initialized successfully"
    )

except Exception as e:

    db_status = "error"

    logger.error(
        "Database error: %s",
        e
    )

# =========================================================
# 📦 ROUTER LOADER
# =========================================================

def load_router(module_path):

    logger.info(
        "Loading router module: %s",
        module_path
    )

    try:

        module = importlib.import_module(
            module_path
        )

        router = getattr(
            module,
            "router",
            None
        )

        return router

    except Exception as e:

        logger.error(
            "Failed to load %s: %s",
            module_path,
            e
        )

        return None

def register(
    router,
    prefix,
    tag
):

    if router:

        app.include_router(
            router,
            prefix=prefix,
            tags=[tag]
        )

        logger.info(
            "Route registered: %s",
            prefix
        )

# =========================================================
# 📡 ROUTES
# =========================================================

routes = {

    "auth": (
        "routes.auth",
        "/api/v1/auth",
        "Authentication"
    ),

    "disease_pytorch": (
        "routes.disease_pytorch",
        "/api/v1/disease",
        "Disease Detection"
    ),

    "history": (
        "routes.history",
        "/api/v1/history",
        "History"
    ),

    "yield": (
        "routes.yield_predict",
        "/api/v1/yield",
        "Yield"
    ),

    "market": (
        "routes.market_forecast",
        "/api/v1/market",
        "Market"
    ),

    "weather": (
        "routes.weather",
        "/api/v1/weather",
        "Weather"
    ),

    "report": (
        "routes.report",
        "/api/v1/report",
        "Report"
    ),

    "ai": (
        "routes.ai_chat",
        "/api/v1/ai",
        "AI Assistant"
    ),

    "news": (
        "routes.news",
        "/api/v1/news",
        "News"
    ),

    "advice": (
        "routes.advice",
        "/api/v1/advice",
        "Advice"
    ),

    "admin": (
        "routes.admin",
        "",
        "Admin"
    ),

    "decision": (
        "routes.decision",
        "/api/v1/decision",
        "Decision"
    ),

    "schemes": (
        "routes.government_schemes",
        "/api/v1/schemes",
        "Schemes"
    ),
}

for _, (
    path,
    prefix,
    tag
) in routes.items():

    router = load_router(path)

    register(
        router,
        prefix,
        tag
    )

# Legacy alias for dashboard integration and API reference compatibility
legacy_advice_router = load_router("routes.advice")
register(
    legacy_advice_router,
    "/api/advice",
    "Advice"
)

# =========================================================
# 🧠 POPULATE ADVISORY KNOWLEDGE (populate_knowledge.py)
# =========================================================

def ensure_advisory_knowledge_populated():

    try:

        database_url = os.getenv("DATABASE_URL", "").strip()

        if database_url and not database_url.startswith("sqlite:///"):
            logger.info(
                "Skipping populate_knowledge.py auto-seed for non-SQLite DATABASE_URL"
            )
            return

        if database_url.startswith("sqlite:///"):
            sqlite_target = database_url.replace("sqlite:///", "", 1)
            if os.path.isabs(sqlite_target):
                db_file = sqlite_target
            else:
                db_file = os.path.normpath(
                    os.path.join(BASE_DIR, sqlite_target)
                )
        else:
            db_file = os.path.join(
                BASE_DIR,
                "database",
                "app.db"
            )

        needs_seed = True

        if os.path.exists(db_file):

            conn = sqlite3.connect(db_file)

            try:

                cursor = conn.cursor()

                cursor.execute(
                    "SELECT COUNT(1) FROM advisory_knowledge"
                )

                row = cursor.fetchone()

                needs_seed = (
                    (not row)
                    or int(row[0]) == 0
                )

            except Exception:

                needs_seed = True

            finally:

                conn.close()

        if needs_seed:

            populate_script = os.path.join(
                BASE_DIR,
                "populate_knowledge.py"
            )

            if os.path.exists(populate_script):

                runpy.run_path(
                    populate_script,
                    run_name="__main__"
                )

                logger.info(
                    "Advisory knowledge populated from populate_knowledge.py"
                )

            else:

                logger.warning(
                    "populate_knowledge.py not found: %s",
                    populate_script
                )

        else:

            logger.info(
                "Advisory knowledge already available in database"
            )

    except Exception as e:

        logger.warning(
            "Advisory knowledge populate step failed: %s",
            e
        )

# =========================================================
# 🤖 PYTORCH MODEL LOAD
# =========================================================

@app.on_event("startup")
def startup_event():

    try:

        ensure_advisory_knowledge_populated()

        device = torch.device(

            "cuda"

            if torch.cuda.is_available()

            else "cpu"
        )

        app.state.device = device

        logger.info(
            f"DEVICE: {device}"
        )

        with open(CLASS_PATH, "r") as f:

            class_names = json.load(f)

        app.state.class_names = class_names

        num_classes = len(class_names)

        logger.info(
            f"TOTAL CLASSES: {num_classes}"
        )

        model = models.mobilenet_v3_small(
            weights=None
        )

        model.classifier[3] = nn.Linear(
            model.classifier[3].in_features,
            num_classes
        )

        model.load_state_dict(

            torch.load(
                MODEL_PATH,
                map_location=device
            )
        )

        model = model.to(device)

        model.eval()

        app.state.model = model

        transform = transforms.Compose([

            transforms.Resize((160, 160)),

            transforms.ToTensor(),

            transforms.Normalize(
                [0.485, 0.456, 0.406],
                [0.229, 0.224, 0.225]
            )
        ])

        app.state.transform = transform

        logger.info(
            "PyTorch Model loaded successfully"
        )

        logger.info(
            "🌱 AgriFuture backend ready"
        )

    except Exception as e:

        logger.error(
            "Startup error: %s",
            e,
            exc_info=True
        )

# =========================================================
# 🏠 ROOT
# =========================================================

@app.get("/")
def home():

    return {

        "status": "success",

        "message":
        "🌱 AgriFuture Running",

        "version":
        APP_VERSION
    }

# =========================================================
# ❤️ HEALTH
# =========================================================

@app.get("/health")
def health():

    model_loaded = (

        hasattr(app.state, "model")

        and

        app.state.model is not None
    )

    return {

        "status": "ok",

        "model_loaded":
        model_loaded,

        "classes_loaded":
        len(
            getattr(
                app.state,
                "class_names",
                []
            )
        ),

        "db":
        db_status,

        "version":
        APP_VERSION
    }

# =========================================================
# 🔁 LEGACY DISEASE ENDPOINT (BACKWARD COMPATIBILITY)
# =========================================================

@app.post("/predict")
async def legacy_predict(
    request: Request,
    file: UploadFile = File(...),
    lang: str = Form("en"),
    region: str = Form("Maharashtra")
):
    from routes.disease_pytorch import predict_disease
    return await predict_disease(request=request, file=file, lang=lang, region=region)

# =========================================================
# 🌱 ADVISORY API
# =========================================================

@app.get("/api/v1/advisory/{disease_name}")
def advisory(disease_name: str):

    data = get_advisory(
        disease_name
    )

    return {

        "status": "success",

        "data": data
    }

# =========================================================
# ❌ ERROR HANDLERS
# =========================================================

@app.exception_handler(
    StarletteHTTPException
)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    return JSONResponse(

        status_code=exc.status_code,

        content={

            "status": "error",

            "message":
            str(exc.detail),

            "request_id":
            request_id
        }
    )

@app.exception_handler(
    RequestValidationError
)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    return JSONResponse(

        status_code=422,

        content={

            "status": "error",

            "message":
            "Validation error",

            "details":
            exc.errors(),

            "request_id":
            request_id
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    logger.error(
        "[%s] UNHANDLED EXCEPTION: %s",
        request_id,
        str(exc),
        exc_info=True
    )

    return JSONResponse(

        status_code=500,

        content={

            "status": "error",

            "message":
            "Internal server error",

            "request_id":
            request_id
        }
    )

# =========================================================
# 🚀 START SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=False,
        log_level="info"
    )
