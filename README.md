# Event Management System

A professional Event Management application built with FastAPI backend and React + TypeScript frontend. This system enables organizations to manage their events with admin controls while providing public access to event information.

## 🚀 MVP Roadmap

### ✅ MVP 1 – Core Setup & Auth (COMPLETED)
**Features:**
- ~~User registration & login (JWT auth)~~ *Simplified: Admin-only login*
- Role-based access (Admin, Client/Attendee)
- Basic admin profile management
- Public event viewing (no login required)

**Tech Stack:**
- Backend: FastAPI (auth, APIs)
- DB: PostgreSQL
- Frontend: React + TypeScript (login/admin pages)

**Goal:** ✅ Secure foundation with authentication & roles

### 🔄 MVP 2 – Event Creation & Management (IN PROGRESS)
**Features:**
- Admin can create, update, delete events
- Event fields: name, date, location, description, capacity
- Public event viewing for all users
- Admin dashboard with quick actions

**Tech Stack:**
- Backend: FastAPI APIs for CRUD
- Frontend: React event list + detail pages
- DB: PostgreSQL (Event table)

**Goal:** Basic event lifecycle management

### 📋 MVP 3 – Ticketing & Registration (PLANNED)
**Features:**
- Attendees register for events
- Generate unique ticket ID (QR code optional)
- Capacity check (no overbooking)

**Tech Stack:**
- Backend: FastAPI APIs for registration & ticketing
- Frontend: Registration form + my tickets page
- DB: Registration & Ticket tables

**Goal:** Core event booking system

### 🎛️ MVP 4 – Admin Panel (PLANNED)
**Features:**
- Enhanced admin panel functionality
- Manage users, events, registrations in clean UI
- Search/filter events & attendees
- Event analytics and reporting

**Tech Stack:**
- Frontend: React dashboard (protected routes)
- Backend: APIs for user/event management

**Goal:** Internal control system for organizers

### 💳 MVP 5 – Payments (FUTURE)
**Features:**
- Integrate Stripe/PayPal for ticket purchase
- Store transactions in DB
- Refunds & payment history

**Goal:** Monetization of events

## 🏗️ Project Structure

```
Event-Management/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models (User, Event)
│   │   ├── routes/         # API routes (auth, events)
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── auth/           # JWT authentication logic
│   │   └── main.py         # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components (Layout)
│   │   ├── pages/         # Page components (Events, Login, Admin)
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # TailwindCSS configuration
├── setup.sh               # Quick setup script
└── README.md              # This file
```

## ✨ Current Features (MVP 1)

### 🔐 Authentication & Authorization
- JWT-based admin authentication
- Role-based access control (Admin only)
- Public access to events (no login required)
- Secure admin dashboard

### 📅 Event Management
- **Public Features:**
  - View all events without login
  - Event detail pages with full information
  - Responsive design for all devices
  
- **Admin Features:**
  - Secure admin login
  - Admin dashboard with quick actions
  - Event management capabilities (create/edit/delete)
  - Professional UI with modern design

### 🎨 User Interface
- Modern, responsive design with TailwindCSS
- Professional color scheme and gradients
- Mobile-first responsive layout
- Clean admin dashboard
- Public event browsing interface

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🔗 API Endpoints

### Public Endpoints
- `GET /events` - List all events (public access)
- `GET /events/{id}` - Get event details (public access)
- `GET /health` - Health check

### Authentication Endpoints
- `POST /auth/login` - Admin login
- `POST /auth/register` - Register new admin user

### Protected Endpoints (Admin Only)
- `POST /events` - Create new event
- `PUT /events/{id}` - Update event
- `DELETE /events/{id}` - Delete event

## 🗄️ Database Setup

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu
   sudo apt install postgresql postgresql-contrib
   ```

2. **Create database:**
   ```bash
   createdb event_management
   ```

3. **Update environment variables:**
   ```bash
   cp backend/env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

4. **Tables are created automatically** when you run the backend

## 👤 Admin User Setup

Create an admin user using curl:

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## 🚀 Quick Setup Script

Use the included setup script for automatic installation:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Set up Python virtual environment
- Install backend dependencies
- Create `.env` file
- Install frontend dependencies

## 🌐 Access Points

- **Frontend (Public):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Admin Dashboard:** http://localhost:3000/admin/profile (after login)

## 📱 User Flows

### Public User Flow
1. Visit http://localhost:3000
2. Browse events without registration
3. View event details

### Admin User Flow
1. Visit http://localhost:3000/login
2. Login with admin credentials
3. Access admin dashboard
4. Manage events through quick actions

## 🛠️ Technology Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- JWT (Authentication)
- Uvicorn (ASGI server)

**Frontend:**
- React 18 (UI framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- React Router (Navigation)

**Development:**
- Python 3.9+
- Node.js 16+
- npm/yarn package manager
