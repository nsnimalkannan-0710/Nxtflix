import { useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import MovieCarousel from "../../components/MovieCarousel/MovieCarousel";
import GenreFilter from "../../components/GenreFilter/GenreFilter";
import MovieCard from "../../components/MovieCard/MovieCard";
import movies from "../../data/movies";
import "./index.css";

function Home() {
  const [activeGenre, setActiveGenre] = useState("All");

  const trending = useMemo(() => {
    return [...movies]
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 16);
  }, []);

  const freshReleases = useMemo(() => {
    return movies.filter((m) => m.year >= 2015).slice(0, 16);
  }, []);

  const filteredMovies = useMemo(() => {
    if (activeGenre === "All") return movies;
    return movies.filter((m) => m.genre === activeGenre);
  }, [activeGenre]);

  return (
    <>
      <Header />

      <section className="hero">
        <div className="hero__inner container">
          <h1 className="hero__title">Discover your next favourite</h1>
          <p className="hero__subtitle">
            Browse {movies.length} movies across every genre, and save the ones
            you love to your Watch Later list.
          </p>
        </div>
      </section>

      <MovieCarousel title="Trending Now" movies={trending} direction="left" />
      <MovieCarousel
        title="Fresh Releases"
        movies={freshReleases}
        direction="right"
      />

      <section className="container home__grid-section">
        <GenreFilter activeGenre={activeGenre} onSelect={setActiveGenre} />

        {filteredMovies.length === 0 ? (
          <p className="home__empty">No movies found for this genre.</p>
        ) : (
          <div className="home__grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
