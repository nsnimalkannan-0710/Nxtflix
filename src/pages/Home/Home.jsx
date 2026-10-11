import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import MovieCarousel from "../../components/MovieCarousel/MovieCarousel";
import GenreFilter from "../../components/GenreFilter/GenreFilter";
import MovieCard from "../../components/MovieCard/MovieCard";
import fallbackMovies from "../../data/movies";
import { fetchMovies, fetchTrendingMovies } from "../../api/movies";
import "./index.css";

function Home() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [allMovies, setAllMovies] = useState(fallbackMovies);
  const [trending, setTrending] = useState(() =>
    [...fallbackMovies].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 16)
  );

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [movieList, trendingList] = await Promise.all([
        fetchMovies(),
        fetchTrendingMovies(),
      ]);
      if (isMounted) {
        if (movieList && movieList.length > 0) setAllMovies(movieList);
        if (trendingList && trendingList.length > 0) setTrending(trendingList);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const freshReleases = useMemo(() => {
    return allMovies.filter((m) => m.year >= 2015).slice(0, 16);
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    if (activeGenre === "All") return allMovies;
    return allMovies.filter((m) => m.genre === activeGenre);
  }, [activeGenre, allMovies]);

  return (
    <>
      <Header />

      <section className="hero">
        <div className="hero__inner container">
          <h1 className="hero__title">Discover your next favourite</h1>
          <p className="hero__subtitle">
            Browse {allMovies.length} movies across every genre, and save the ones
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
