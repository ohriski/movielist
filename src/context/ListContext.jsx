import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const ListContext = createContext();
const STATUSES = ["Plan to Watch", "Watching", "Watched", "Dropped"];

export function ListProvider({ children }) {
  const { user } = useAuth();
  const [list, setList] = useState({});

  useEffect(() => {
    if (!user) {
      setList({});
      return;
    }
    supabase
      .from("movielist")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const mapped = {};
        data.forEach((row) => {
          mapped[row.movie_id] = { ...row.movie_data, status: row.status };
        });
        setList(mapped);
      });
  }, [user]);

  const setStatus = async (movie, status) => {
    const updated = { ...list, [movie.id]: { ...movie, status } };
    setList(updated);
    await supabase.from("movielist").upsert(
      {
        user_id: user.id,
        movie_id: movie.id,
        status,
        movie_data: movie,
      },
      { onConflict: "user_id,movie_id" },
    );
  };

  const removeMovie = async (id) => {
    const updated = { ...list };
    delete updated[id];
    setList(updated);
    await supabase
      .from("movielist")
      .delete()
      .eq("user_id", user.id)
      .eq("movie_id", id);
  };

  return (
    <ListContext.Provider value={{ list, setStatus, removeMovie, STATUSES }}>
      {children}
    </ListContext.Provider>
  );
}

export const useList = () => useContext(ListContext);
