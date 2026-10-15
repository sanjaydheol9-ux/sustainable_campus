from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

# Database file location (relative to project root)
DB_PATH = Path(__file__).resolve().parents[2] / "data" / "campus.db"
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
