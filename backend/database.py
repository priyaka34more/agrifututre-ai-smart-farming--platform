import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# =========================
# 🗄️ DATABASE URL (PostgreSQL)
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("CRITICAL: DATABASE_URL environment variable is not set!")

# Fix for some PaaS providing postgres:// instead of postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# =========================
# ⚙️ ENGINE (SAFE CONFIG)
# =========================
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False  # set True only for debugging SQL queries
)

# =========================
# 🔗 SESSION
# =========================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =========================
# 🧱 BASE MODEL
# =========================
Base = declarative_base()

# =========================
# 🧠 DB HEALTH CHECK
# =========================
def check_db_connection():
    try:
        with engine.connect() as conn:
            pass
        return True
    except Exception as e:
        print(f"❌ DB Connection Failed: {e}")
        return False