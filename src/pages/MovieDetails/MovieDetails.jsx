import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import fallbackMovies from "../../data/movies";
import { fetchMovieById, getMovieStreamUrl } from "../../api/movies";
import { useWatchLater } from "../../context/WatchLaterContext";
import "./index.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchLater, toggleWatchLater } = useWatchLater();

  const [movie, setMovie] = useState(() =>
    fallbackMovies.find((m) => String(m.id) === String(id)) || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMovie() {
      const data = await fetchMovieById(id);
      if (isMounted && data) {
        setMovie(data);
      }
    }
    loadMovie();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // No matching movie -> redirect to not-found
  if (!movie) {
    return <Navigate to="/not-found" replace />;
  }

  const saved = isInWatchLater(movie.id);
  const streamUrl = getMovieStreamUrl(movie.id);

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
        <button className="details__back" onClick={() => navigate(-1)}>
          ← Go Back
        </button>

        <div className="details__body">
          <img src={movie.poster} alt={movie.title} className="details__poster" />

          <div className="details__info">
            <h1 className="details__title">{movie.title}</h1>

            <div className="details__meta">
              <span className="details__genre-tag">{movie.genre}</span>
              <span>{movie.year}</span>
              <span>{movie.duration}</span>
              <span className="details__rating">★ {movie.rating}</span>
            </div>

            <p className="details__overview">{movie.overview}</p>

            <div className="details__actions">
              <button
                className="details__play-btn"
                onClick={() => {
                  setIsPlaying(true);
                  setVideoError(false);
                }}
              >
                ▶ Stream Video
              </button>

              <button
                className={
                  "details__watch-later" +
                  (saved ? " details__watch-later--active" : "")
                }
                onClick={() => toggleWatchLater(movie)}
              >
                {saved ? "✓ Added to Watch Later" : "+ Watch Later"}
              </button>
            </div>

            {isPlaying && (
              <div className="details__player-wrapper">
                <div className="details__player-header">
                  <span>Now Streaming: {movie.title}</span>
                  <button
                    className="details__close-player"
                    onClick={() => setIsPlaying(false)}
                  >
                    ✕ Close Player
                  </button>
                </div>
                <video
                  className="details__video"
                  controls
                  autoPlay
                  src={streamUrl}
                  poster={movie.backdrop}
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
                {videoError && (
                  <div className="details__stream-notice">
                    Note: Backend video stream endpoint ({streamUrl}) requires Google Cloud Service Account credentials (<code>service-account.json</code>) and a valid Google Drive file ID to stream live video files.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MovieDetails;
