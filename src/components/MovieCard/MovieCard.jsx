import { useNavigate } from "react-router-dom";
import "./index.css";

function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movies/${movie.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/movies/${movie.id}`);
      }}
    >
      <div className="movie-card__poster-wrap">
        <img src={movie.poster} alt={movie.title} className="movie-card__poster" />
        <span className="movie-card__rating">★ {movie.rating}</span>
        <div className="movie-card__play-overlay">▶</div>
      </div>

      <h3 className="movie-card__title">{movie.title}</h3>
      <p className="movie-card__meta">
        {movie.genre} · {movie.year} · {movie.duration}
      </p>
    </div>
  );
}

export default MovieCard;
