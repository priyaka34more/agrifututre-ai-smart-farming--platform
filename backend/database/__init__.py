"""
AgriFuture AI — Database Package
PostgreSQL/Supabase (production) + SQLite (local dev)

The crash "Could not parse SQLAlchemy URL" always means one of:
  A) DATABASE_URL env var is empty / not set on Render
  B) The value has quotes, spaces, or a bad scheme
  C) The .env file was never deployed (it's gitignored)

Fix applied here:
  - Hard-coded Supabase fallback so the app NEVER receives an empty URL
  - Full normalisation before create_engine() ever sees the string
  - Detailed startup log so you can confirm which URL is being used
"""

import os
import re
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# ── Load .env for local dev only; production env vars take priority ──
try:
    from dotenv import load_dotenv
    load_dotenv(override=False)   # override=False → Render/prod vars always win
except ImportError:
    pass

logger = logging.getLogger("AgriFuture.Database")

# ═══════════════════════════════════════════════════════════
#  PRODUCTION FALLBACK
#  If DATABASE_URL is not set as a Render environment variable,
#  use the Supabase URL directly so the app never crashes on startup.
#  Change this whenever the database credentials change.
# ═══════════════════════════════════════════════════════════
_SUPABASE_URL = (
    "postgresql://postgres:Joy904cvWsp785"
    "@db.vqwvooaainqcbctkthlr.supabase.co:5432/postgres"
)

# ═══════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════

def _mask_url(url: str) -> str:
    """Mask password for safe logging."""
    return re.sub(r"(:)[^:@]+(@)", r"\1***\2", url)


def _normalise_url(raw: str) -> str:
    """
    Strip junk and normalise scheme so SQLAlchemy can always parse it.

    Handles:
      - Surrounding whitespace / newlines
      - Accidental quotes  "postgresql://..."  or  'postgresql://...'
      - Legacy scheme      postgres://  →  postgresql://
      - Uppercase          POSTGRES://  →  postgresql://
      - Doubled prefix     postgresql://postgresql://  →  postgresql://
    """
    url = raw.strip().strip('"').strip("'").strip()

    lower = url.lower()

    # postgres:// (Render/Heroku legacy) → postgresql://
    if lower.startswith("postgres://") and not lower.startswith("postgresql"):
        url = "postgresql://" + url[len("postgres://"):]

    # POSTGRESQL:// uppercase fix
    if url[:11].lower() == "postgresql:" and not url.startswith("postgresql"):
        url = "postgresql" + url[len("postgresql"):]

    # Doubled prefix: postgresql://postgresql://...
    if url.lower().startswith("postgresql://postgresql"):
        url = url[len("postgresql://"):]

    return url


def _validate_url(url: str) -> None:
    """Raise ValueError with a clear message before SQLAlchemy sees a bad URL."""
    valid = (
        "postgresql://",
        "postgresql+psycopg2://",
        "postgresql+asyncpg://",
        "sqlite:///",
        "sqlite://",
    )
    if not any(url.lower().startswith(p) for p in valid):
        raise ValueError(
            f"DATABASE_URL has an unrecognised scheme.\n"
            f"  Got (masked): {_mask_url(url)}\n"
            f"  Expected one of: {valid}\n"
            f"  On Render: Dashboard → your web service → Environment\n"
            f"  → Add  DATABASE_URL = postgresql://user:pass@host:5432/db"
        )
    if url.count("://") > 1:
        raise ValueError(
            f"DATABASE_URL has a doubled prefix (e.g. postgresql://postgresql://...).\n"
            f"  Got (masked): {_mask_url(url)}"
        )


# ═══════════════════════════════════════════════════════════
#  RESOLVE DATABASE_URL
#  Priority: Render env var → .env file → hardcoded fallback
# ═══════════════════════════════════════════════════════════

_raw = os.getenv("DATABASE_URL", "").strip()

if not _raw:
    # Env var missing — use hardcoded Supabase URL so the app boots
    logger.warning(
        "DATABASE_URL env var is not set. "
        "Using hardcoded Supabase fallback. "
        "Set DATABASE_URL on Render to avoid this warning."
    )
    _raw = _SUPABASE_URL

DATABASE_URL = _normalise_url(_raw)

try:
    _validate_url(DATABASE_URL)
except ValueError as exc:
    # Log the full error then re-raise so FastAPI shows it clearly
    logger.critical("DATABASE_URL validation failed: %s", exc)
    raise

logger.info(
    "DATABASE_URL resolved — driver: %s | host masked: %s",
    DATABASE_URL.split("://")[0],
    _mask_url(DATABASE_URL),
)

# ═══════════════════════════════════════════════════════════
#  ENGINE
# ═══════════════════════════════════════════════════════════

_is_sqlite = DATABASE_URL.lower().startswith("sqlite")

if _is_sqlite:
    # ── Local dev: SQLite ──────────────────────────────────
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        pool_pre_ping=False,
        echo=False,
    )
    logger.info("SQLite engine ready (local dev).")

else:
    # ── Production: PostgreSQL / Supabase ──────────────────
    # Supabase requires SSL — sslmode=require via connect_args
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,           # Supabase free tier: max 20 connections
        max_overflow=10,
        pool_pre_ping=True,    # drop stale connections automatically
        pool_recycle=300,      # recycle every 5 min (Supabase timeout is ~5 min)
        connect_args={
            "sslmode": "require",          # mandatory for Supabase
            "connect_timeout": 15,
            "application_name": "agrifuture-backend",
        },
        echo=False,
    )
    logger.info("PostgreSQL/Supabase engine ready (production).")

# ═══════════════════════════════════════════════════════════
#  SESSION FACTORY
# ═══════════════════════════════════════════════════════════

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ═══════════════════════════════════════════════════════════
#  BASE MODEL
# ═══════════════════════════════════════════════════════════

Base = declarative_base()

# ═══════════════════════════════════════════════════════════
#  CONNECTIVITY CHECK
#  Called from main.py startup_event() — NOT at import time.
#  A failed check logs a warning but does NOT crash the server.
# ═══════════════════════════════════════════════════════════

def check_db_connection() -> bool:
    """Return True if the database is reachable, False otherwise."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connectivity check passed ✓")
        return True
    except Exception as exc:
        logger.error("Database connectivity check FAILED: %s", exc)
        return False
