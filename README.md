# 🎬 VideoStream — Video Streaming & Reward Platform

A full-stack video streaming platform inspired by LuluStream. Built with **React + Node.js/Express + PostgreSQL**.

---

## 📁 Project Structure

```
videostream/
├── backend/          # Express.js API
│   ├── config/
│   │   ├── db.js         # PostgreSQL connection
│   │   └── schema.sql    # Database schema (run this first)
│   ├── middleware/
│   │   └── auth.js       # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js       # /api/auth/*
│   │   ├── videos.js     # /api/videos/*
│   │   └── earnings.js   # /api/earnings/*
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/         # React app
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   └── ProtectedRoute.js
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── pages/
        │   ├── Home.js         # Landing page (matching screenshot)
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js    # Earnings & stats
        │   └── Upload.js       # Upload video
        ├── App.js
        └── index.css           # Global styles
```

---

## 🚀 Setup Instructions

### 1. PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE videostream;
\q

# Run schema
psql -U postgres -d videostream -f backend/config/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secret:
#   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/videostream
#   JWT_SECRET=your_random_secret_here

# Start server
npm run dev    # development (with nodemon)
npm start      # production
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs on: **http://localhost:3000**

The frontend is configured to proxy API requests to `localhost:5000` via `"proxy"` in `package.json`.

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Create account |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/profile | ✅ | Update profile |
| GET | /api/videos | ❌ | List videos |
| GET | /api/videos/trending | ❌ | Trending videos |
| GET | /api/videos/:id | ❌ | Get video (records view) |
| POST | /api/videos | ✅ | Upload video |
| DELETE | /api/videos/:id | ✅ | Delete video |
| GET | /api/videos/user/:userId | ❌ | User's videos |
| GET | /api/earnings | ✅ | Earnings summary |
| GET | /api/earnings/history | ✅ | Earnings history |
| GET | /api/earnings/top-videos | ✅ | Top earning videos |

---

## 💰 Earning Model

- Every video view = **$0.001** earned
- Premium video views earn more (configurable)
- Earnings tracked in the `earnings` table
- Dashboard shows today's earnings vs yesterday (% change)

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (pg driver) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Styling | Custom CSS, Google Fonts (Outfit) |

---

## 🔒 Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 7 days
- Express-validator for input validation
- CORS configured for frontend origin
- SQL injection prevention via parameterized queries

---

## 📦 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Run `npm run build` in frontend
3. Backend will serve the built React app from `frontend/build`
4. Use a process manager like PM2: `pm2 start server.js`
5. Set up PostgreSQL on your server (e.g., AWS RDS, Supabase, Neon)

---

## 🎨 Features

- ✅ Dark theme matching LuluStream design
- ✅ User authentication (register/login/logout)
- ✅ Video upload with URL-based hosting
- ✅ Earnings per view system
- ✅ Dashboard with real-time stats
- ✅ Trending videos
- ✅ Responsive design
- ✅ JWT-protected routes
- ✅ PostgreSQL with proper indexing