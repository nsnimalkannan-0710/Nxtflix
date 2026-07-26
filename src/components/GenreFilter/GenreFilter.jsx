import { GENRES } from "../../data/movies";
import "./index.css";

function GenreFilter({ activeGenre, onSelect }) {
  return (
    <div className="genre-filter">
      {GENRES.map((genre) => (
        <button
          key={genre}
          className={
            "genre-filter__chip" +
            (activeGenre === genre ? " genre-filter__chip--active" : "")
          }
          onClick={() => onSelect(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

export default GenreFilter;
