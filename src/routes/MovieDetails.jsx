import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useList } from "../context/ListContext";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const statusColors = {
  "Plan to Watch": "bg-blue-500",
  Watching: "bg-green-500",
  Watched: "bg-purple-500",
  Dropped: "bg-red-500",
};

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const { list, STATUSES, setStatus, removeMovie } = useList();
  const currentStatus = movie ? list[movie.id]?.status : null;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [movieRes, creditsRes, videosRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`,
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=en-US`,
          ),
          fetch(
            `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`,
          ),
        ]);
        const [movieData, creditsData, videosData] = await Promise.all([
          movieRes.json(),
          creditsRes.json(),
          videosRes.json(),
        ]);

        setMovie(movieData);
        setCast(creditsData.cast?.slice(0, 10) ?? []);
        setTrailer(
          videosData.results?.find(
            (v) => v.site === "YouTube" && v.type === "Trailer",
          ) ?? null,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!movie)
    return (
      <div className="p-10 text-center text-slate-400">Movie not found.</div>
    );

  return (
    <div
      className="min-h-screen bg-slate-900"
      onClick={() => setShowMenu(false)}
    >
      {movie.backdrop_path && (
        <div
          className="w-full h-72 bg-cover bg-center"
          style={{
            backgroundImage: `url(${BACKDROP_BASE}${movie.backdrop_path})`,
          }}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8 mt-10">
        <div className="flex gap-8 items-start">
          {movie.poster_path && (
            <img
              src={`${IMG_BASE}${movie.poster_path}`}
              alt={movie.title}
              className="w-48 rounded-xl shadow-lg flex-shrink-0 -mt-6"
            />
          )}
          <div className="flex flex-col gap-3 pt-2">
            <h1 className="text-4xl font-bold text-slate-100">{movie.title}</h1>
            <div className="flex gap-3 text-sm text-slate-400">
              <span>{movie.release_date?.slice(0, 4)}</span>
              {movie.runtime && <span>· {movie.runtime} min</span>}
              <span>· ⭐ {movie.vote_average?.toFixed(1)}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-slate-300 leading-relaxed">{movie.overview}</p>

            {/* Status button */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors ${
                  currentStatus
                    ? statusColors[currentStatus]
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {currentStatus ?? "Add to List"} ▾
              </button>

              {showMenu && (
                <div className="absolute top-10 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatus(movie, s);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-700 transition-colors ${
                        currentStatus === s
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
                  {currentStatus && (
                    <div className="border-t border-slate-700">
                      <button
                        onClick={() => {
                          removeMovie(movie.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {trailer && (
          <div>
            <h2 className="text-xl font-semibold text-slate-300 mb-3">
              Trailer
            </h2>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              className="w-full aspect-video rounded-xl"
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        {cast.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-300 mb-3">Cast</h2>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col items-center text-center gap-1"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full aspect-square object-cover object-top rounded-full"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-slate-700 rounded-full" />
                  )}
                  <span className="text-xs text-slate-400 leading-tight">
                    {person.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
