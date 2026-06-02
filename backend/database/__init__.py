import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

# ==========================================
# DATABASE URL
# ==========================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./database/app.db"
)

# ==========================================
# DATABASE ENGINE
# ==========================================

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# ==========================================
# SESSION
# ==========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==========================================
# BASE MODEL
# ==========================================

Base = declarative_base()

# ==========================================
# DATABASE CONNECTION CHECK
# ==========================================

def check_db_connection():
    try:
        with engine.connect() as conn:
            print("✅ Database Connected Successfully")
        return True
    except Exception as e:
        print("❌ Database Connection Failed:", e)
        return False