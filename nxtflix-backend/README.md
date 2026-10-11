# NxtFlix Backend API Server

RESTful API backend for **NxtFlix** built with **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Google Drive API (`googleapis`)** for video streaming via HTTP Range requests (`206 Partial Content`).

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Google Cloud & Google Drive Setup](#google-cloud--google-drive-setup)
3. [PostgreSQL Database Setup](#postgresql-database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Starting the Backend Server](#starting-the-backend-server)
6. [API Endpoints & Testing with cURL](#api-endpoints--testing-with-curl)

---

## 🏛️ Architecture Overview

* **Node.js / Express**: RESTful endpoints with helmet, CORS, and rate limiting.
* **Prisma ORM**: Type-safe client communicating with PostgreSQL.
* **JWT Auth**: `jsonwebtoken` with `bcryptjs` password hashing.
* **Google Drive API**: Streams video chunks directly from Google Drive using Service Account authentication and HTTP Range requests.

---

## ☁️ Google Cloud & Google Drive Setup (For Video Streaming)

To stream movie videos stored in your Google account / Google Drive:

### Step 1: Create a Google Cloud Project & Enable Drive API
1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a project (e.g. `nxtflix-streaming`).
3. In the search bar, search for **Google Drive API** and click **Enable**.

### Step 2: Create a Service Account & Download Key
1. Go to **IAM & Admin** > **Service Accounts**.
2. Click **Create Service Account**.
   - Name: `nxtflix-drive-streamer`
   - Role: Project Viewer or default.
3. Click on the created service account, navigate to the **Keys** tab.
4. Click **Add Key** > **Create New Key** > choose **JSON** > click **Create**.
5. Save this downloaded file into `nxtflix-backend/` and rename it to:
   ```
   service-account.json
   ```
   *(Note: `service-account.json` is already included in `.gitignore` so your private credentials will never be committed to GitHub).*

### Step 3: Share Your Google Drive Folder with the Service Account
1. Open [Google Drive](https://drive.google.com/) where your movies are uploaded.
2. Open your Service Account's email address (e.g. `nxtflix-drive-streamer@your-project-id.iam.gserviceaccount.com`).
3. Right-click your movie folder (or video files) in Google Drive > click **Share**.
4. Paste the Service Account email address, set permission to **Viewer**, and click **Send / Share**.

### Step 4: Obtain Google Drive File IDs
For each uploaded video in Google Drive:
1. Right click the video > **Share** > **Copy link**.
2. The URL looks like:
   `https://drive.google.com/file/d/1dQv5X8Lz2M9aBcDeFgHiJkLmNoPqRsTu/view?usp=sharing`
3. The File ID is the segment between `/d/` and `/view`:
   `1dQv5X8Lz2M9aBcDeFgHiJkLmNoPqRsTu`
4. Add or update this ID in your `movies` table in PostgreSQL under `google_drive_file_id`.

---

## 🗄️ PostgreSQL Database Setup

### Option A: Local PostgreSQL (with pgAdmin)
1. Open pgAdmin or SQL Shell (`psql`).
2. Create the database:
   ```sql
   CREATE DATABASE nxtflix;
   ```
3. In `nxtflix-backend/.env`, set your PostgreSQL user and password:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nxtflix?schema=public"
   ```

### Option B: Free Cloud PostgreSQL (Neon / Supabase)
1. Create a free database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the Connection String into `nxtflix-backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Push Schema & Seed Initial Data
Inside `nxtflix-backend/`:
```bash
npx prisma db push
npm run db:seed
```
This generates the tables and seeds 10 sample movies along with a test user (`user@example.com` / `password123`).

---

## ⚙️ Environment Configuration (`.env`)

Example `.env` in `nxtflix-backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nxtflix?schema=public"
JWT_SECRET=nxtflix_super_secret_jwt_key_2026_nxtwatch
JWT_EXPIRES_IN=7d
GOOGLE_SERVICE_ACCOUNT_PATH=./service-account.json
FRONTEND_ORIGIN=http://localhost:5173
```

---

## 🏃 Starting the Backend Server

```bash
cd nxtflix-backend
npm install
npm run dev
```
The server will start listening on `http://localhost:5000`.

---

## 📡 API Endpoints & Testing with cURL

### 1. User Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "password": "password123"}'
```

### 2. User Signin
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```
Response:
```json
{
  "success": true,
  "message": "Login successful",
  "jwt_token": "eyJhbGciOi...",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
}
```

### 3. Get Current User Profile (Protected)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Fetch All Movies (with Optional Genre & Search)
```bash
curl "http://localhost:5000/api/movies?genre=Action&search=shadow" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Fetch Trending Movies
```bash
curl http://localhost:5000/api/movies/trending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Fetch Movie By ID
```bash
curl http://localhost:5000/api/movies/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Video Streaming from Google Drive (HTTP Range Request)
```bash
curl -i -X GET "http://localhost:5000/api/movies/1/stream" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Range: bytes=0-1048575"
```
Returns `206 Partial Content` with `Content-Range: bytes 0-1048575/totalSize`.

### 8. Watch Later
* **Get Watch Later list**:
  ```bash
  curl http://localhost:5000/api/watch-later -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
* **Add movie to Watch Later**:
  ```bash
  curl -X POST http://localhost:5000/api/watch-later/1 -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
* **Remove movie from Watch Later**:
  ```bash
  curl -X DELETE http://localhost:5000/api/watch-later/1 -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
