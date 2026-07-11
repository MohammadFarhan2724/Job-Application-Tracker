# Trackr — Job Application Tracker

A full-stack MERN application to organize, track, and automate your job search. Log applications manually or let Trackr detect them automatically from your Gmail inbox.

Live demo: [job-application-tracker-1-jbgz.onrender.com](https://job-application-tracker-1-jbgz.onrender.com)

---

## Features

- Secure authentication — JWT-based auth with hashed passwords
- Application tracking — Add, view, update, and delete job applications
- Status pipeline — Track applications through Saved → Applied → In Progress → Interviewing → Offer / Rejected
- Gmail auto-detection — Connect your Gmail account and automatically import applications detected from confirmation, assessment, and interview emails
- User-scoped data — Every application is strictly scoped to its owner; no cross-user data leakage
- Custom dark UI — Hand-designed interface with a distinct visual identity

---

## Tech Stack

### Frontend
- React.js — UI library
- React Router — Client-side routing
- Tailwind CSS — Utility-first styling
- React Query (TanStack Query) — Server-state management, caching, and refetching
- dnd-kit — Drag-and-drop interactions
- Recharts — Dashboard charts and visualizations
- Axios — HTTP client with interceptors for auth and error handling

### Backend
- Node.js — Runtime
- Express.js — Web framework and REST API
- MongoDB — Database
- Mongoose — ODM / schema modeling
- JWT (jsonwebtoken) — Authentication tokens
- bcrypt — Password hashing
- Zod — Request validation
- googleapis — Gmail API integration for OAuth and email fetching

### Deployment
- Render — Backend deployed as a Node Web Service; frontend deployed as a Static Site
- Environment-based configuration for local development and production

---

## Gmail Auto-Detection

One of Trackr's core features is automatically detecting job applications from your inbox:

1. Connect Gmail — Authenticate via Google OAuth 2.0 (read-only `gmail.readonly` scope — Trackr can never send, delete, or modify your emails)
2. Sync Gmail — Trackr searches your inbox for application-related emails using a targeted search query
3. Parse & extract — Each matching email is parsed to extract the company name, job role, and application status (Applied, Online Assessment, Interviewing, Offer, Rejected)
4. Auto-save — New applications are created automatically; existing ones are updated in place as their status progresses, without creating duplicates

---

## Project Structure

```
job-application-tracker/
├── backend/
│   ├── controllers/       # Route handlers (auth, applications, Gmail import)
│   ├── middleware/        # JWT auth, request validation
│   ├── models/            # Mongoose schemas (User, Application)
│   ├── routes/            # Express route definitions
│   ├── services/          # Google OAuth/Gmail API service, email parser service
│   └── index.js           # App entry point
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance and API service modules
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Route-level pages (Dashboard, Login, Register)
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Google Cloud project with Gmail API enabled (for the Gmail auto-detection feature)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/google` | Get the Google OAuth consent URL (protected) |
| GET | `/api/auth/google/callback` | OAuth callback — saves Gmail tokens |
| GET | `/api/applications` | Get all applications for the logged-in user |
| POST | `/api/applications` | Create a new application |
| GET | `/api/applications/:id` | Get a single application |
| PATCH | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |
| POST | `/api/import/gmail` | Sync and import applications from Gmail |

---

## Deployment

Both services are deployed on [Render](https://render.com):

- Backend — Node Web Service (root directory: `backend`, build: `npm install`, start: `npm start`)
- Frontend — Static Site (root directory: `frontend`, build: `npm run build`, publish directory: `dist`)

Environment variables are configured separately per service in the Render dashboard and are not committed to the repository.

---

## License

This project was built as a personal portfolio project.