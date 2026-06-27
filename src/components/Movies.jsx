import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useList } from "../context/ListContext";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

export async function searchMovies(query) {
  const [movieRes, tvRes] = await Promise.all([
    fetch(
      `/api/tmdb?endpoint=search/movie&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    ),
    fetch(
      `/api/tmdb?endpoint=search/tv&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    ),
  ]);
  const [movieData, tvData] = await Promise.all([
    movieRes.json(),
    tvRes.json(),
  ]);

  const movies = (movieData.results ?? []).map((m) => ({
    ...m,
    media_type: "movie",
  }));
  const shows = (tvData.results ?? []).map((s) => ({
    ...s,
    media_type: "tv",
    title: s.name,
    release_date: s.first_air_date,
  }));

  return [...movies, ...shows].sort((a, b) => b.popularity - a.popularity);
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const statusColors = {
  "Plan to Watch": "bg-blue-500",
  Watching: "bg-green-500",
  Watched: "bg-purple-500",
  Dropped: "bg-red-500",
};

function MovieCard({ movie, openId, setOpenId }) {
  const { list, setStatus, removeMovie, STATUSES } = useList();
  const hasPoster = Boolean(movie.poster_path);
  const currentStatus = list[movie.id]?.status;
  const showPicker = openId === movie.id;

  const handlePlusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenId(showPicker ? null : movie.id);
  };

  const handleStatusClick = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus(movie, status);
    setOpenId(null);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeMovie(movie.id);
    setOpenId(null);
  };

  return (
    <Link to={`/${movie.media_type}/${movie.id}`}>
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

        {movie.media_type === "tv" && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            TV
          </span>
        )}

        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handlePlusClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center leading-none text-white text-lg font-bold shadow-lg transition-opacity
    ${currentStatus ? statusColors[currentStatus] : "bg-black/60 border border-white/40 opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
          >
            {currentStatus ? "✓" : "+"}
          </button>

          {showPicker && (
            <>
              <div className="absolute top-9 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[140px] w-fit">
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
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const handler = () => setOpenId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!movies.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 w-full">
      {movies.map((movie) => (
        <MovieCard
          key={`${movie.media_type}-${movie.id}`}
          movie={movie}
          openId={openId}
          setOpenId={setOpenId}
        />
      ))}
    </div>
  );
}
