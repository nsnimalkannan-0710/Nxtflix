# NxtFlix Backend Specification & Architecture Guide

## 1. Project Context & Goals
**NxtFlix** is a full-featured video streaming web application modeled after Netflix. The frontend is built using **React 19**, **Vite**, and **React Router v7**, currently tracking on GitHub at [https://github.com/nsnimalkannan-0710/Nxtflix](https://github.com/nsnimalkannan-0710/Nxtflix).

The goal is to construct a scalable backend RESTful API service backed by **PostgreSQL** (managed via **pgAdmin**) and **Google Drive API (`googleapis`)** for video asset storage and streaming.

---

## 2. Tech Stack Requirements

* **Runtime & Framework**: Node.js + Express.js (or NestJS / Fastify)
* **Database**: PostgreSQL (managed using pgAdmin 4)
* **ORM / Query Builder**: Prisma ORM, Drizzle ORM, or `pg` (node-postgres)
* **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for password hashing
* **Cloud Media Storage**: Google Drive API via `googleapis` SDK (Service Account authentication)
* **Streaming Protocol**: HTTP Range Requests (`206 Partial Content`) for video playback support

---

## 3. Current Frontend Implementation Details

### Current Auth Integration (`src/api/auth.js`)
* **Endpoint**: `POST /api/auth/signin`
* **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
* **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "jwt_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
* **Frontend Token Handling**:
  The frontend stores the JWT token in cookies under key `jwt_token`. The defensive token reader supports `result.data.token`, `result.token`, `result.jwt_token`, or `result.jwtToken`.

### Current Movie Data Schema (`src/data/movies.js`)
Existing frontend mock data contains fields structured as follows:
```json
{
  "id": 1,
  "title": "Shadow Protocol",
  "genre": "Action",
  "year": 2005,
  "rating": "6.0",
  "duration": "90 min",
  "poster": "https://picsum.photos/seed/nxtflix1/400/560",
  "backdrop": "https://picsum.photos/seed/nxtflixbd1/1280/500",
  "overview": "Shadow Protocol is a gripping action story following unforgettable characters..."
}
```

---

## 4. PostgreSQL Database Schema Design

```sql
-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT 'https://assets.ccbp.in/frontend/react-js/nxt-watch/profile-img.png',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MOVIES TABLE
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    release_year INTEGER NOT NULL,
    rating NUMERIC(3, 1) NOT NULL,
    duration VARCHAR(20) NOT NULL,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT NOT NULL,
    overview TEXT NOT NULL,
    google_drive_file_id VARCHAR(255) NOT NULL, -- Google Drive Video File ID
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WATCH LATER TABLE (User Favorites / Bookmark List)
CREATE TABLE watch_later (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_trending ON movies(is_trending);
CREATE INDEX idx_watch_later_user ON watch_later(user_id);
```

---

## 5. Google Drive Video Streaming Integration (`googleapis`)

Videos are stored in a dedicated Google Drive folder. The backend uses a Google Service Account (`service-account.json`) to stream video content directly to the client browser using HTTP Range headers.

### Google Drive Service Configuration (`config/googleDrive.js`)
```javascript
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/service-account.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

module.exports = drive;
```

### Video Stream Controller (`GET /api/movies/:id/stream`)
Supports chunked video streaming with standard HTML5 `<video>` controls:
```javascript
const drive = require('../config/googleDrive');
const { getMovieById } = require('../models/movieModel');

async function streamMovie(req, res) {
  try {
    const { id } = req.params;
    const movie = await getMovieById(id);
    if (!movie || !movie.google_drive_file_id) {
      return res.status(404).json({ message: 'Movie video not found' });
    }

    const fileId = movie.google_drive_file_id;
    const range = req.headers.range;

    // Get metadata to determine file size & MIME type
    const fileMetaData = await drive.files.get({
      fileId,
      fields: 'size, mimeType',
    });

    const fileSize = parseInt(fileMetaData.data.size, 10);
    const mimeType = fileMetaData.data.mimeType || 'video/mp4';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });

      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
      );
      response.data.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
      });

      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      response.data.pipe(res);
    }
  } catch (error) {
    console.error('Streaming Error:', error);
    res.status(500).json({ message: 'Error streaming video' });
  }
}
```

---

## 6. API Endpoint Specification

### Authentication Routes (`/api/auth`)
* **`POST /api/auth/signup`**
  * Body: `{ "name": "John", "email": "john@example.com", "password": "password123" }`
  * Action: Hashes password, creates user in PostgreSQL, returns JWT.
* **`POST /api/auth/signin`**
  * Body: `{ "email": "john@example.com", "password": "password123" }`
  * Action: Verifies credentials, returns `jwt_token` and user object.
* **`GET /api/auth/me`** *(Protected)*
  * Headers: `Authorization: Bearer <token>`
  * Action: Returns current logged-in user profile.

### Movie Routes (`/api/movies`)
* **`GET /api/movies`** *(Protected)*
  * Query Params: `?genre=Action&search=shadow`
  * Action: Returns list of movies matching search/genre filter.
* **`GET /api/movies/trending`** *(Protected)*
  * Action: Returns list of movies marked as `is_trending = true`.
* **`GET /api/movies/:id`** *(Protected)*
  * Action: Returns detailed metadata for a single movie.
* **`GET /api/movies/:id/stream`** *(Protected)*
  * Action: Streams video file from Google Drive with `206 Partial Content`.

### Watch Later Routes (`/api/watch-later`)
* **`GET /api/watch-later`** *(Protected)*
  * Action: Fetches all saved movies for the authenticated user.
* **`POST /api/watch-later/:movieId`** *(Protected)*
  * Action: Adds movie to user's watch later list.
* **`DELETE /api/watch-later/:movieId`** *(Protected)*
  * Action: Removes movie from user's watch later list.

---

## 7. Frontend Integration Checklist
1. Update `src/api/auth.js` base URL to `http://localhost:5000/api/auth`.
2. Replace static `src/data/movies.js` with API calls (`fetch('/api/movies')`).
3. Wire `<video src="http://localhost:5000/api/movies/${id}/stream">` in `MovieDetails.jsx`.
4. Connect `WatchLaterContext.jsx` with `POST /api/watch-later/:id` and `DELETE /api/watch-later/:id`.
