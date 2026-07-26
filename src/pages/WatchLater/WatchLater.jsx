import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import MovieCard from "../../components/MovieCard/MovieCard";
import { useWatchLater } from "../../context/WatchLaterContext";
import "./index.css";

function WatchLater() {
  const { watchLater } = useWatchLater();

  return (
    <>
      <Header />

      <div className="container watch-later">
        <h1 className="watch-later__title">Watch Later</h1>

        {watchLater.length === 0 ? (
          <div className="watch-later__empty">
            <p>Your Watch Later list is empty.</p>
            <Link to="/" className="watch-later__browse">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="watch-later__grid">
            {watchLater.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default WatchLater;
