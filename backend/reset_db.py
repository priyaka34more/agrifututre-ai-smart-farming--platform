import os
from database import engine, Base
from models.user_model import User
from models.history_model import DetectionHistory
from models.scheme_model import Scheme
from models.yield_prediction_model import YieldPrediction
from models.market_forecast_model import MarketForecast
from models.govt_scheme_activity_model import GovtSchemeActivity

def reset_database():
    db_path = os.path.join(os.path.dirname(__file__), "agri.db")
    if os.path.exists(db_path):
        print(f"Removing old database: {db_path}")
        try:
            os.remove(db_path)
        except Exception as e:
            print(f"Error removing file: {e}")
            return
    
    print("Creating fresh tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")

if __name__ == "__main__":
    reset_database()
