# NxtFlix Backend API Server

RESTful API backend for **NxtFlix** built using Node.js, Express, Prisma ORM, PostgreSQL, and Google Drive API.

---

## 🚀 Quick Setup Instructions

### 1. Install Dependencies
```bash
cd nxtflix-backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and verify database credentials:
```bash
cp .env.example .env
```

Ensure PostgreSQL is running locally (e.g. on port `5432`) and your password matches `DATABASE_URL` in `.env`.

### 3. PostgreSQL Database Initialization (via pgAdmin / Prisma)
Run Prisma migrations to create the database schema:
```bash
npx prisma migrate dev --name init
```

Seed initial dataset (~10 movies + 1 test user):
```bash
npm run db:seed
```

### 4. Google Drive Integration (Optional for Video Streaming)
Place your Google Service Account key file at `nxtflix-backend/service-account.json`.

---

## 🏃 Running the Server

* **Development mode**:
  ```bash
  npm run dev
  ```
* **Production mode**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints Summary

### Auth
* `POST /api/auth/signup` — Register new user
* `POST /api/auth/signin` — Authenticate & receive JWT token
* `GET /api/auth/me` — Current user profile *(Header: `Authorization: Bearer <token>`)*

### Movies
* `GET /api/movies` — List movies *(Supports `?genre=Action` and `?search=title`)*
* `GET /api/movies/trending` — List trending movies
* `GET /api/movies/:id` — Get single movie details
* `GET /api/movies/:id/stream` — Stream video file from Google Drive (`206 Partial Content`)

### Watch Later
* `GET /api/watch-later` — List saved movies for user
* `POST /api/watch-later/:movieId` — Add movie to watch later list
* `DELETE /api/watch-later/:movieId` — Remove movie from watch later list
