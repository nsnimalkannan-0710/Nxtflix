# NXTFLIX

A movie streaming discovery app built with React 19, React Router 7, and Vite 7.

## Features
- JWT-based sign in against a live API, token stored in a cookie
- Protected routes (Home, Movie Details, Watch Later) via a `jwt_token` cookie check
- Trending Now / Fresh Releases carousels (auto-scrolling, pausable on hover/focus)
- Genre filter chips + responsive movie grid
- Movie details page with Watch Later toggle
- Watch Later list persisted in `localStorage`
- 404 page for unknown routes / invalid movie ids

## Getting started

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

Sign in with:
- Email: `admin@example.com`
- Password: `admin123`

## Build

```bash
npm run build
```

Output goes to the `build/` folder.

## ⚠️ Important: swap in the real movie data

`src/data/movies.js` currently contains **50 placeholder movies** (same schema:
id, title, genre, year, rating, duration, poster, backdrop, overview) generated
locally, because the required catalog JSON is hosted at a URL that isn't reachable
from this build environment.

Before submitting, replace the contents of `src/data/movies.js` with the real
50-movie catalog from the assessment's Section 8 link, keeping this structure:

```js
export const GENRES = ["All", "Action", "Drama", "Comedy", "Thriller", "Sci-Fi", "Romance", "Horror", "Fantasy"];

const movies = [ /* the 50 real movie objects */ ];

export default movies;
```

## Project structure

```
src/
  api/auth.js                     -> signIn() API call
  context/WatchLaterContext.jsx   -> global watch-later state (localStorage-backed)
  components/
    ProtectedRoute.jsx
    Header/
    MovieCard/
    MovieCarousel/
    GenreFilter/
  pages/
    Login/
    Home/
    MovieDetails/
    WatchLater/
    NotFound/
  data/movies.js
  App.jsx
  main.jsx
```
