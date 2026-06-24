import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [customLabel, setCustomLabel] = useState(
    () => localStorage.getItem("avatar_label") ?? "",
  );
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name ?? "";
  const email = user?.email ?? "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email[0]?.toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleLabelSave = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      setEditing(false);
      localStorage.setItem("avatar_label", customLabel);
    }
  };

  const handleAvatarClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLabelClick = (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-900 backdrop-blur-sm border-b border-slate-900 shadow-lg z-50">
      <div className="mx-auto flex items-center justify-between px-8 py-3">
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

          <div className="relative" ref={menuRef}>
            <button
              onClick={handleAvatarClick}
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-700 hover:ring-2 hover:ring-blue-400 transition-all flex-shrink-0"
            >
              {customLabel ? (
                <span
                  className="text-white font-bold leading-none text-center w-full flex items-center justify-center"
                  style={{ fontSize: "clamp(6px, 1.8vw, 11px)" }}
                >
                  {customLabel}
                </span>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">{initials}</span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 w-64 overflow-hidden">
                <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-700">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-700 flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-100 font-semibold text-sm truncate">
                      {fullName}
                    </span>
                    <span className="text-slate-400 text-xs truncate">
                      {email}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-slate-400 text-xs mb-2">
                    Custom avatar label
                  </p>
                  {editing ? (
                    <input
                      ref={inputRef}
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      onKeyDown={handleLabelSave}
                      onBlur={handleLabelSave}
                      maxLength={6}
                      placeholder="e.g. 😎 or nickname"
                      className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-slate-500"
                    />
                  ) : (
                    <button
                      onClick={handleLabelClick}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {customLabel
                        ? `"${customLabel}" — click to change`
                        : "Click to set a label"}
                    </button>
                  )}
                </div>

                <button
                  onClick={signOut}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
