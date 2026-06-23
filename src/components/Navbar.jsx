import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900 backdrop-blur-sm border-b border-slate-900 shadow-lg z-50">
      <div className="mx-auto flex items-center justify-between px-8 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          MovieList
        </Link>

        <div className="flex items-center gap-8 text-slate-200 font-medium">
          <Link
            to="/search"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Search
          </Link>

          <Link
            to="/yourlist"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Your List
          </Link>

          <Link
            to="/profile"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
