# NxtFlix Backend — Build Spec for Antigravity

## 0. How to use this document

This is an implementation brief for an AI coding agent. Build the backend exactly as specified below, phase by phase. Do not invent endpoints, fields, or auth behavior that contradicts what's written here — the frontend is already built and expects these exact contracts.

Repo reference (frontend, already built): https://github.com/nsnimalkannan-0710/Nxtflix

---

## 1. Project Goal

Build a Node.js/Express REST API for **NxtFlix**, a Netflix-style streaming app. It must:

- Serve movie metadata from PostgreSQL
- Authenticate users with JWT
- Stream video files from Google Drive using HTTP Range requests (`206 Partial Content`)
- Support a per-user "Watch Later" list

The frontend (React 19 + Vite + React Router v7) is already complete and will consume this API as-is. **Do not change the response shapes below** — they must match what the frontend already expects.

---

## 2. Tech Stack (fixed choices — do not substitute)

| Concern             | Choice                                                   |
| ------------------- | -------------------------------------------------------- |
| Runtime/Framework   | Node.js + Express.js                                     |
| Database            | PostgreSQL                                               |
| ORM                 | Prisma ORM                                               |
| Auth                | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing   |
| Cloud video storage | Google Drive API via `googleapis` (Service Account auth) |
| Streaming           | HTTP Range Requests (206 Partial Content)                |
| Env config          | `dotenv`                                                 |
| Validation          | `zod` or `express-validator` (agent's choice)            |
| Dev tooling         | `nodemon` for local dev                                  |

---

## 3. Project Structure to Generate

```
nxtflix-backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── googleDrive.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   └── watchLaterController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # verifies JWT, attaches req.user
│   │   └── errorHandler.js
│   ├── models/                     # if not using Prisma client directly in controllers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   └── watchLaterRoutes.js
│   ├── utils/
│   │   └── jwt.js
│   └── app.js
├── service-account.json            # gitignored, placeholder only
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## 4. Environment Variables (`.env.example`)

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nxtflix
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GOOGLE_SERVICE_ACCOUNT_PATH=./service-account.json
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
FRONTEND_ORIGIN=http://localhost:5173
```

CORS must be enabled for `FRONTEND_ORIGIN` with credentials support.

---

## 5. Database Schema

Implement via Prisma, generating from this exact SQL intent:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT 'https://assets.ccbp.in/frontend/react-js/nxt-watch/profile-img.png',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    google_drive_file_id VARCHAR(255) NOT NULL,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watch_later (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_trending ON movies(is_trending);
CREATE INDEX idx_watch_later_user ON watch_later(user_id);
```

Also generate a `prisma/seed.js` that inserts ~10 sample movies (reuse fields from the frontend's existing mock shape: title, genre, year, rating, duration, poster, backdrop, overview) plus one test user, so the API is testable immediately after setup.

---

## 6. Auth Contract (must match frontend exactly)

### `POST /api/auth/signup`

Body: `{ "name": "John", "email": "john@example.com", "password": "password123" }`

- Hash password with bcryptjs, create user, return same shape as signin below.

### `POST /api/auth/signin`

Body:

```json
{ "email": "user@example.com", "password": "yourpassword" }
```

Response (this exact shape — frontend reads `jwt_token` and `user`):

```json
{
  "success": true,
  "message": "Login successful",
  "jwt_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
}
```

> Note: the frontend's token reader defensively also checks `result.data.token`, `result.token`, `result.jwtToken` — but `jwt_token` at the top level is the primary field. Keep it as shown above.

### `GET /api/auth/me` _(protected)_

Header: `Authorization: Bearer <token>`
Returns current user profile (no password hash).

**Auth middleware**: verify JWT from `Authorization: Bearer <token>`, attach `req.user = { id, email }`, return `401` on missing/invalid token.

---

## 7. Movie Routes (`/api/movies`) — all protected

| Route                                        | Behavior                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| `GET /api/movies?genre=Action&search=shadow` | Filter by genre and/or case-insensitive title search |
| `GET /api/movies/trending`                   | Movies where `is_trending = true`                    |
| `GET /api/movies/:id`                        | Single movie detail                                  |
| `GET /api/movies/:id/stream`                 | Streams video from Google Drive, see §9              |

Movie object shape returned to frontend should map DB columns to the frontend's existing camelCase-friendly fields (`id, title, genre, year, rating, duration, poster, backdrop, overview`) — adapt `release_year → year`, `poster_url → poster`, `backdrop_url → backdrop` in the response serializer so the frontend needs zero changes.

---

## 8. Watch Later Routes (`/api/watch-later`) — all protected

| Route                              | Behavior                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/watch-later`             | List saved movies for `req.user.id`, joined with movie details           |
| `POST /api/watch-later/:movieId`   | Insert; handle unique constraint (already-added) gracefully with 200/409 |
| `DELETE /api/watch-later/:movieId` | Remove by user+movie                                                     |

---

## 9. Google Drive Streaming

Service account config at `src/config/googleDrive.js`:

```javascript
const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });
module.exports = drive;
```

`GET /api/movies/:id/stream` controller logic:

1. Look up `movie.google_drive_file_id` by `:id`.
2. Fetch file metadata (`size`, `mimeType`) via `drive.files.get`.
3. If `Range` header present: parse `start`/`end`, respond `206` with `Content-Range`, `Accept-Ranges`, `Content-Length`, `Content-Type`, then pipe the ranged Drive stream to `res`.
4. If no `Range` header: respond `200` with full `Content-Length`/`Content-Type`, pipe full stream.
5. Wrap in try/catch → `500` with JSON error on failure; `404` if movie or file id missing.

Use the reference implementation already validated in the spec (adapt to Prisma for the `getMovieById` call) — don't redesign the streaming logic, just implement it cleanly.

---

## 10. Cross-Cutting Requirements

- **CORS**: allow `FRONTEND_ORIGIN` with credentials.
- **Error handling**: central `errorHandler.js` middleware; consistent JSON error shape `{ "message": "..." }`.
- **Security**: helmet, rate limiting on `/api/auth/*` (e.g. `express-rate-limit`), never log passwords or tokens.
- **Validation**: reject malformed signup/signin bodies with `400` before hitting the DB.
- **.gitignore**: must exclude `node_modules`, `.env`, `service-account.json`.

---

## 11. Build Order (do these phases in sequence)

1. Scaffold project structure, `package.json`, `.env.example`, `.gitignore`.
2. Set up Prisma schema + migration matching §5; write and run seed script.
3. Implement auth (signup, signin, me, JWT middleware) — verify contract in §6 exactly.
4. Implement movie routes (list/filter, trending, detail) with response field mapping from §7.
5. Implement Google Drive config + streaming controller per §9.
6. Implement watch-later routes per §8.
7. Add CORS, helmet, rate limiting, central error handler.
8. Write a `README.md` covering: local setup, running Prisma migrate/seed, required Google service account steps, and how to test each endpoint (curl or Postman examples for every route above).

## 12. Acceptance Checklist

- [ ] `POST /api/auth/signup` and `/signin` return the exact response shape in §6
- [ ] Protected routes reject requests without a valid Bearer token (401)
- [ ] `GET /api/movies` supports `genre` and `search` query params
- [ ] `GET /api/movies/:id/stream` correctly returns 206 for ranged requests and 200 otherwise, and playback works in an HTML5 `<video>` tag
- [ ] Watch Later add/remove/list works per user and respects the unique constraint
- [ ] `.env.example`, seed data, and README are present so the project runs from a clean clone
