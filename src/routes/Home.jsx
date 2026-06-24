import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w300";

const MovieCard = ({ movie }) => {
  const mediaType = movie.media_type ?? "movie";
  return (
    <Link to={`/${mediaType}/${movie.id}`} className="flex-shrink-0 w-32 group">
      <div className="w-32 h-48 rounded-lg overflow-hidden bg-slate-700 group-hover:ring-2 group-hover:ring-blue-400 transition-all">
        {movie.poster_path ? (
          <img
            src={`${IMG_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center px-2">
            {movie.title}
          </div>
        )}
      </div>
      <p className="text-slate-300 text-xs mt-1 truncate">
        {movie.title ?? movie.name}
      </p>
      {mediaType === "tv" && <span className="text-xs text-slate-500">TV</span>}
    </Link>
  );
};

const Row = ({ title, movies, loading }) => (
  <div className="mb-10">
    <h2 className="text-slate-100 text-lg font-semibold mb-3">{title}</h2>
    {loading ? (
      <div className="text-slate-400 text-sm">Loading...</div>
    ) : movies.length === 0 ? (
      <div className="text-slate-500 text-sm">Nothing here yet.</div>
    ) : (
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scroll">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    )}
  </div>
);

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recently_viewed") ?? "[]");
    setRecentlyViewed(stored.slice(0, 10));

    fetch(`/api/tmdb?endpoint=trending/all/week&language=en-US`)
      .then((res) => res.json())
      .then((data) => setTrending(data.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 w-full px-8 py-10">
      {recentlyViewed.length > 0 && (
        <Row title="Recently Viewed" movies={recentlyViewed} loading={false} />
      )}
      <Row title="Trending" movies={trending} loading={loading} />
    </div>
  );
};

export default Home;
