# Event Management MVP - Project Structure

## Overview
This is a full-stack Event Management application with FastAPI backend and React + TypeScript frontend.

## Backend Structure (`backend/`)

### Core Application (`app/`)
```
app/
├── __init__.py
├── main.py                 # FastAPI application entry point
├── models/                 # Database models
│   ├── __init__.py
│   ├── database.py         # Database configuration and session
│   ├── user.py            # User model with roles
│   └── event.py           # Event model
├── schemas/               # Pydantic schemas for validation
│   ├── __init__.py
│   ├── user.py            # User request/response schemas
│   └── event.py           # Event request/response schemas
├── routes/                # API route handlers
│   ├── __init__.py
│   ├── auth.py            # Authentication routes (login/register)
│   └── events.py          # Event routes (list/details)
└── auth/                  # Authentication utilities
    ├── __init__.py
    └── jwt.py             # JWT token handling
```

### Configuration Files
- `requirements.txt` - Python dependencies
- `env.example` - Environment variables template
- `.env` - Environment variables (create from template)

## Frontend Structure (`frontend/`)

### Source Code (`src/`)
```
src/
├── components/            # Reusable React components
│   └── Layout.tsx        # Main layout with navigation
├── pages/                # Page components
│   ├── Login.tsx         # User login page
│   ├── Register.tsx      # User registration page
│   ├── Events.tsx        # Events listing page
│   └── EventDetail.tsx   # Individual event details page
├── services/             # API service layer
│   └── api.ts           # Axios configuration and API calls
├── types/                # TypeScript type definitions
│   └── index.ts         # Interface definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles with TailwindCSS
```

### Configuration Files
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - TailwindCSS configuration
- `postcss.config.js` - PostCSS configuration

## Key Features Implemented

### Backend (FastAPI)
- ✅ User authentication with JWT tokens
- ✅ User registration and login endpoints
- ✅ Role-based access (admin/attendee)
- ✅ Event listing and detail endpoints
- ✅ PostgreSQL database with SQLAlchemy ORM
- ✅ Automatic database table creation
- ✅ Sample data seeding
- ✅ CORS configuration for frontend
- ✅ Input validation with Pydantic schemas

### Frontend (React + TypeScript)
- ✅ User login and registration forms
- ✅ Protected routes with authentication
- ✅ Events listing with responsive grid layout
- ✅ Individual event detail pages
- ✅ JWT token storage and management
- ✅ API service layer with axios
- ✅ TypeScript type safety
- ✅ TailwindCSS styling
- ✅ Responsive design

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Events
- `GET /events` - List all events (requires auth)
- `GET /events/{id}` - Get event details (requires auth)

## Database Models

### User Model
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Hashed password
- `role` - User role (admin/attendee)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Event Model
- `id` - Primary key
- `name` - Event name
- `description` - Event description (optional)
- `start_date` - Event start date/time
- `end_date` - Event end date/time
- `location` - Event location
- `created_at` - Event creation timestamp
- `updated_at` - Last update timestamp

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- CORS configuration
- Input validation and sanitization

## Development Setup
1. Run `./setup.sh` for automatic setup
2. Configure database credentials in `backend/.env`
3. Start backend: `cd backend && uvicorn app.main:app --reload`
4. Start frontend: `cd frontend && npm start`

## Production Considerations
- Use environment variables for sensitive data
- Implement proper error handling
- Add logging and monitoring
- Set up database migrations
- Configure HTTPS
- Implement rate limiting
- Add input sanitization
- Set up proper CORS policies
