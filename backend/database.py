"""
database.py — thin compatibility shim.

The canonical implementation lives in database/__init__.py (the package).
This file re-exports everything so any code that was previously importing
`from database import ...` via the flat-file path continues to work.

Do NOT add engine/session logic here — it all lives in database/__init__.py.
"""
from database import Base, engine, SessionLocal, check_db_connection, DATABASE_URL  # noqa: F401
