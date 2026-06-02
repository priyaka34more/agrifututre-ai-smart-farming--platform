from sqlalchemy.engine import make_url

cases = [
    "postgres://user:pass@host:5432/db",
    "postgresql://user:pass@host:5432/db",
    "postgresql+psycopg2://user:pass@host:5432/db",
    "  postgresql://user:pass@host/db  ",
    "'postgresql://user:pass@host/db'",
    '"postgresql://user:pass@host/db"',
    "sqlite:///./agri.db",
    "postgres://",
    "POSTGRES://user:pass@host/db",
]

for raw in cases:
    cleaned = raw.strip().strip('"').strip("'").strip()
    if cleaned.lower().startswith("postgres://"):
        cleaned = "postgresql://" + cleaned[len("postgres://"):]
    try:
        u = make_url(cleaned)
        print(f"OK  | {raw[:50]!r:52} -> {u.drivername}")
    except Exception as e:
        print(f"ERR | {raw[:50]!r:52} -> {e}")
