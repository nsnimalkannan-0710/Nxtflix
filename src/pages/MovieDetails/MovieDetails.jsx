import { useParams, useNavigate, Navigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import movies from "../../data/movies";
import { useWatchLater } from "../../context/WatchLaterContext";
import "./index.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater } = useWatchLater();

  const movie = movies.find((m) => String(m.id) === id);

  if (!movie) {
    return <Navigate to="/not-found" replace />;
  }

  const saved = isInWatchLater(movie.id);

  return (
    <>
      <Header />

      <div
        className="details__backdrop"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="details__backdrop-overlay" />
      </div>

      <div className="container details__content">
        <div className="details__body">
          <img
            src={movie.poster}
            alt={movie.title}
            className="details__poster"
          />

          <div className="details__info">
            <h1 className="details__title">{movie.title}</h1>

            <div className="details__meta">
              <span className="details__genre-tag">{movie.genre}</span>
              <span>{movie.year}</span>
              <span>{movie.duration}</span>
              <span className="details__rating">★ {movie.rating}</span>
            </div>

            <p className="details__overview">{movie.overview}</p>

            {/* Action Buttons Row */}
            <div className="details__actions">
              <button
                className={
                  "details__watch-later" +
                  (saved ? " details__watch-later--active" : "")
                }
                onClick={() => toggleWatchLater(movie)}
              >
                {saved ? "✓ Added to Watch Later" : "+ Watch Later"}
              </button>

              <button className="details__back" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MovieDetails;