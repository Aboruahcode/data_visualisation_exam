# backend/app/main.py
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import json
from typing import List

# Database setup
DATABASE_URL = "sqlite:///./covid19_data.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database models
class CovidData(Base):
    __tablename__ = 'covid_data'
    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, index=True)
    cases = Column(Integer)
    deaths = Column(Integer)
    date = Column(String)

# Pydantic schemas
class DataItem(BaseModel):
    country: str
    cases: int
    deaths: int
    date: str

class DataUploadResponse(BaseModel):
    filename: str
    status: str

# FastAPI instance and CORS setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to create database tables and get database session
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API endpoints
@app.get("/", response_model=List[DataItem])
def read_data(db: Session = Depends(get_db)):
    items = db.query(CovidData).all()
    return items

@app.post("/upload/", response_model=DataUploadResponse)
async def upload_json(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="File must be a JSON.")
    content = await file.read()
    try:
        data = json.loads(content)
        # Example transformation: Filter for certain criteria or modify data format
        transformed_data = [
            {
                'country': d['country'],
                'cases': int(d.get('cases', 0)),
                'deaths': int(d.get('deaths', 0)),
                'date': d['date']
            }
            for d in data if 'country' in d and 'date' in d
        ]
        # Store data to database
        for item in transformed_data:
            db_item = CovidData(**item)
            db.add(db_item)
        db.commit()
        return {"filename": file.filename, "status": "File processed and data stored successfully"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Main execution guard
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)