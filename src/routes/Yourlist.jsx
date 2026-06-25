import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useList } from "../context/ListContext";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const statusColors = {
  "Plan to Watch": "bg-blue-500",
  Watching: "bg-green-500",
  Watched: "bg-purple-500",
  Dropped: "bg-red-500",
};

export default function Yourlist() {
  const { list, STATUSES, setStatus, removeMovie } = useList();
  const [openMenu, setOpenMenu] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch] = useState("");
  const movies = Object.values(list);

  const toggleCollapse = (status) => {
    setCollapsed((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const filteredMovies = (status) =>
    movies.filter(
      (m) =>
        m.status === status &&
        (m.title?.toLowerCase().includes(search.toLowerCase()) ||
          m.original_title?.toLowerCase().includes(search.toLowerCase())),
    );

  if (!movies.length) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-lg">
          Your list is empty. Search for movies to add them!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10">
      <div className="w-full max-w-screen-2xl mx-auto flex flex-col gap-10">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-slate-100">Your List</h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your list..."
            className="ml-4 bg-transparent border border-slate-700 focus:border-slate-500 rounded-full px-4 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none transition-colors"
          />
        </div>

        {STATUSES.map((status) => {
          const filtered = filteredMovies(status);
          if (!filtered.length) return null;
          const isCollapsed = collapsed[status];
          return (
            <div key={status}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[status]}`}
                />
                <h2 className="text-xl font-semibold text-slate-300">
                  {status}
                </h2>
                <span className="text-slate-600 text-sm">
                  ({filtered.length})
                </span>
                <button
                  onClick={() => toggleCollapse(status)}
                  className="ml-2 text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded transition-colors"
                >
                  {isCollapsed ? "show" : "hide"}
                </button>
              </div>

              {!isCollapsed && (
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                  {filtered.map((movie) => (
                    <div
                      key={movie.id}
                      className="relative group rounded-lg overflow-visible"
                      onMouseLeave={() => setOpenMenu(null)}
                    >
                      <Link to={`/${movie.media_type ?? "movie"}/${movie.id}`}>
                        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                          {movie.poster_path ? (
                            <img
                              src={`${POSTER_BASE}${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full aspect-[2/3] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                              {movie.title}
                            </div>
                          )}
                        </div>
                      </Link>

                      {movie.media_type === "tv" && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
                          TV
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenu(openMenu === movie.id ? null : movie.id);
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                      >
                        ⋯
                      </button>

                      {openMenu === movie.id && (
                        <div className="absolute top-8 right-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden min-w-[150px]">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setStatus(movie, s);
                                setOpenMenu(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-700 transition-colors ${
                                movie.status === s
                                  ? "text-white font-semibold"
                                  : "text-slate-300"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${statusColors[s]}`}
                              />
                              {s}
                            </button>
                          ))}
                          <div className="border-t border-slate-700">
                            <button
                              onClick={() => {
                                removeMovie(movie.id);
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
