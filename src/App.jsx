import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Home from "./pages/Home/Home";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import WatchLater from "./pages/WatchLater/WatchLater";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccessDenied from "./pages/AccessDenied/AccessDenied";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forbidden" element={<AccessDenied />} />
      <Route path="/not-found" element={<NotFound />} />

      {/* Protected (User & Admin) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movies/:id"
        element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watch-later"
        element={
          <ProtectedRoute>
            <WatchLater />
          </ProtectedRoute>
        }
      />

      {/* Protected (Admin Only) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
