import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useList } from "../context/ListContext";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const statusColors = {
  "Plan to Watch": "bg-blue-500",
  Watching: "bg-green-500",
  Watched: "bg-purple-500",
  Dropped: "bg-red-500",
};

export default function MovieDetail() {
  const { type, id } = useParams();
  const [media, setMedia] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const { list, STATUSES, setStatus, removeMovie } = useList();
  const currentStatus = media ? list[media.id]?.status : null;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mediaRes, creditsRes, videosRes] = await Promise.all([
          fetch(`/api/tmdb?endpoint=${type}/${id}&language=en-US`),
          fetch(`/api/tmdb?endpoint=${type}/${id}/credits&language=en-US`),
          fetch(`/api/tmdb?endpoint=${type}/${id}/videos&language=en-US`),
        ]);
        const [mediaData, creditsData, videosData] = await Promise.all([
          mediaRes.json(),
          creditsRes.json(),
          videosRes.json(),
        ]);

        if (type === "tv") {
          mediaData.title = mediaData.name;
          mediaData.release_date = mediaData.first_air_date;
          mediaData.runtime = mediaData.episode_run_time?.[0];
          mediaData.media_type = "tv";
        } else {
          mediaData.media_type = "movie";
        }

        setMedia(mediaData);
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
  }, [type, id]);

  useEffect(() => {
    if (!media) return;
    const stored = JSON.parse(localStorage.getItem("recently_viewed") ?? "[]");
    const filtered = stored.filter((m) => m.id !== media.id);
    const updated = [
      {
        id: media.id,
        title: media.title,
        poster_path: media.poster_path,
        media_type: media.media_type,
      },
      ...filtered,
    ].slice(0, 20);
    localStorage.setItem("recently_viewed", JSON.stringify(updated));
  }, [media]);

  if (loading)
    return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!media)
    return <div className="p-10 text-center text-slate-400">Not found.</div>;

  return (
    <div
      className="min-h-screen bg-slate-900"
      onClick={() => setShowMenu(false)}
    >
      {media.backdrop_path && (
        <div
          className="w-full h-72 bg-cover bg-center"
          style={{
            backgroundImage: `url(${BACKDROP_BASE}${media.backdrop_path})`,
          }}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8 mt-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {media.poster_path && (
            <img
              src={`${IMG_BASE}${media.poster_path}`}
              alt={media.title}
              className="w-full md:w-48 rounded-xl shadow-lg flex-shrink-0 md:-mt-6"
            />
          )}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-slate-100">
                {media.title}
              </h1>
              {type === "tv" && (
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                  TV Show
                </span>
              )}
            </div>
            <div className="flex gap-3 text-sm text-slate-400">
              <span>{media.release_date?.slice(0, 4)}</span>
              {media.runtime && <span>· {media.runtime} min</span>}
              {type === "tv" && media.number_of_seasons && (
                <span>
                  · {media.number_of_seasons} season
                  {media.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
              <span>· ⭐ {media.vote_average?.toFixed(1)}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {media.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-slate-300 leading-relaxed">{media.overview}</p>

            <div
              className="relative inline-block"
              onClick={(e) => e.stopPropagation()}
            >
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
                <div className="absolute top-10 left-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 w-fit whitespace-nowrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatus(media, s);
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                        currentStatus === s
                          ? "text-white font-semibold"
                          : "text-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {currentStatus && (
                    <div className="border-t border-slate-700">
                      <button
                        onClick={() => {
                          removeMovie(media.id);
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
