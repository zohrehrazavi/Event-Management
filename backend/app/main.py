from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from .models.database import engine, Base, get_db
from .models.user import User
from .models.event import Event
from .routes import auth, events

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Event Management API",
    description="A FastAPI backend for Event Management application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(events.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Event Management API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Add some sample data for testing
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    
    # Check if we already have events
    existing_events = db.query(Event).count()
    if existing_events == 0:
        # Create sample events
        sample_events = [
            Event(
                name="Tech Conference 2024",
                description="Annual technology conference featuring the latest innovations",
                start_date=datetime(2024, 6, 15, 9, 0),
                end_date=datetime(2024, 6, 15, 17, 0),
                location="San Francisco Convention Center"
            ),
            Event(
                name="Startup Meetup",
                description="Networking event for startup founders and investors",
                start_date=datetime(2024, 7, 20, 18, 0),
                end_date=datetime(2024, 7, 20, 21, 0),
                location="Downtown Innovation Hub"
            ),
            Event(
                name="Design Workshop",
                description="Hands-on workshop for UI/UX designers",
                start_date=datetime(2024, 8, 10, 10, 0),
                end_date=datetime(2024, 8, 10, 16, 0),
                location="Creative Design Studio"
            )
        ]
        
        for event in sample_events:
            db.add(event)
        
        db.commit()
        print("Sample events created successfully!")
    
    db.close()
