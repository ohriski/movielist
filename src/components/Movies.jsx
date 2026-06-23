import { useState } from "react";
import { Link } from "react-router-dom";
import { useList } from "../context/ListContext";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

export async function searchMovies(query) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    query,
  )}&include_adult=false&language=en-US&page=1`;

  const res = await fetch(url);
  const json = await res.json();
  return json.results;
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const statusColors = {
  "Plan to Watch": "bg-blue-500",
  Watching: "bg-green-500",
  Watched: "bg-purple-500",
  Dropped: "bg-red-500",
};

function MovieCard({ movie }) {
  const { list, setStatus, removeMovie, STATUSES } = useList();
  const [showPicker, setShowPicker] = useState(false);
  const hasPoster = Boolean(movie.poster_path);
  const currentStatus = list[movie.id]?.status;

  const handlePlusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  const handleStatusClick = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus(movie, status);
    setShowPicker(false);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeMovie(movie.id);
    setShowPicker(false);
  };

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="relative group flex flex-col bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
        {hasPoster ? (
          <img
            src={`${POSTER_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-400 text-sm px-4 text-center">
            No poster available
          </div>
        )}

        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handlePlusClick}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg transition-opacity
              ${
                currentStatus
                  ? statusColors[currentStatus]
                  : "bg-slate-800/80 opacity-0 group-hover:opacity-100"
              }`}
          >
            {currentStatus ? "✓" : "+"}
          </button>

          {showPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPicker(false);
                }}
              />
              <div className="absolute top-9 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-20 min-w-[140px]">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => handleStatusClick(e, s)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 ${
                      currentStatus === s
                        ? "font-semibold text-blue-400"
                        : "text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {currentStatus && (
                  <button
                    onClick={handleRemove}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 border-t border-slate-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Movies({ movies }) {
  if (!movies.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 w-full">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
