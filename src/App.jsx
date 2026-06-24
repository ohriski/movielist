import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Search from "./routes/Search";
import Yourlist from "./routes/Yourlist";
import Profile from "./routes/Profile";
import MovieDetails from "./routes/MovieDetails";
import Footer from "./components/Footer";
import { ListProvider } from "./context/ListContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Login from "./routes/Login";

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Login />;

  return (
    <ListProvider>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <div className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/yourlist" element={<Yourlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/:type/:id" element={<MovieDetails />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </ListProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
