import { useNavigate } from "react-router-dom";
import "./index.css";

/**
 * direction: "left" | "right" -> which way the track auto-scrolls
 * We duplicate the movie list so the CSS animation can loop seamlessly:
 * when the first copy scrolls fully out of view, the second copy is
 * already in the same visual position, so the loop is invisible.
 */
function MovieCarousel({ title, movies, direction = "left" }) {
  const navigate = useNavigate();
  const trackMovies = [...movies, ...movies];

  return (
    <section className="carousel">
      <h2 className="carousel__title">{title}</h2>

      <div className="carousel__viewport">
        <div
          className={`carousel__track carousel__track--${direction}`}
          tabIndex={0}
        >
          {trackMovies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="carousel__item"
              onClick={() => navigate(`/movies/${movie.id}`)}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="carousel__poster"
              />
              <div className="carousel__overlay">
                <p className="carousel__item-title">{movie.title}</p>
                <p className="carousel__item-meta">
                  {movie.genre} · ★ {movie.rating}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MovieCarousel;
