import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ onSearch, initialValue = "" }) => {
  const [input, setInput] = useState(initialValue);

  useEffect(() => {
    if (!input) {
      onSearch("");
      return;
    }
    const timer = setTimeout(() => onSearch(input), 500);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="input-wrapper">
      {" "}
      <FaSearch id="search_icon" />
      <input
        placeholder="Whatcha lookin for"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
