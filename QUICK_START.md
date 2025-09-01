# Quick Start Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- PostgreSQL database running
- Git (for cloning the repository)

## 1. Database Setup
1. Create a PostgreSQL database named `event_management`
2. Note down your database credentials (username, password, host, port)

## 2. Automatic Setup (Recommended)
Run the setup script to automatically configure both backend and frontend:
```bash
./setup.sh
```

## 3. Manual Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your database credentials
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
```

## 4. Configuration
Edit `backend/.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/event_management
SECRET_KEY=your-secret-key-here-make-it-long-and-secure
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 5. Start the Application

### Start Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```
Backend will be available at: http://localhost:8000

### Start Frontend
```bash
cd frontend
npm start
```
Frontend will be available at: http://localhost:3000

## 6. Test the Application

1. **Register a new user:**
   - Go to http://localhost:3000/register
   - Create an account (you can choose admin or attendee role)

2. **Login:**
   - Go to http://localhost:3000/login
   - Sign in with your credentials

3. **Browse Events:**
   - After login, you'll be redirected to the events page
   - View the sample events that were automatically created
   - Click on any event to see details

## 7. API Documentation
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## 8. Sample Data
The application automatically creates sample events when first started:
- Tech Conference 2024
- Startup Meetup
- Design Workshop

## Troubleshooting

### Backend Issues
- **Database connection error:** Check your PostgreSQL credentials in `.env`
- **Port already in use:** Change the port in the uvicorn command
- **Module not found:** Make sure you're in the virtual environment

### Frontend Issues
- **Port already in use:** React will automatically suggest an alternative port
- **API connection error:** Ensure the backend is running on port 8000
- **Build errors:** Check Node.js version and try `npm install` again

### Common Issues
- **CORS errors:** Check that the frontend URL is in `ALLOWED_ORIGINS`
- **JWT token issues:** Verify the `SECRET_KEY` is set in `.env`
- **Database tables not created:** The tables are created automatically on first run

## Next Steps
- Explore the API documentation at http://localhost:8000/docs
- Check the project structure in `PROJECT_STRUCTURE.md`
- Review the main README.md for detailed information
- Consider adding more features for MVP 2
