import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Movies, { searchMovies } from "../components/Movies";

const Search = () => {
  const [movies, setMovies] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) searchMovies(q).then(setMovies);
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      setMovies([]);
      setSearchParams({});
      return;
    }
    setSearchParams({ q: query });
    const results = await searchMovies(query);
    setMovies(results);
  };

  return (
    <div className="min-h-screen bg-slate-900 w-full flex justify-center px-6">
      <div className="flex flex-col items-center w-full max-w-6xl gap-8 pt-5">
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchParams.get("q") ?? ""}
        />
        <Movies movies={movies} />
      </div>
    </div>
  );
};

export default Search;
