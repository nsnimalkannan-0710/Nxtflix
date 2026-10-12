import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header/Header";
import {
  getAdminAnalytics,
  getUsers,
  updateUserRole,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../../api/admin";
import { fetchMovies } from "../../api/movies";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

const GENRES = ["Action", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"];

const initialMovieForm = {
  title: "",
  genre: "Action",
  year: new Date().getFullYear(),
  rating: "7.5",
  duration: "120 min",
  poster: "",
  backdrop: "",
  overview: "",
  googleDriveFileId: "1eFgHiJkLmNoPqRsTuVwXyZ0123456789",
  isTrending: false,
};

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "movies" | "users"

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [moviesList, setMoviesList] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Movies search & filter
  const [movieSearch, setMovieSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  // Users search
  const [userSearch, setUserSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null); // null for new, object for edit
  const [movieForm, setMovieForm] = useState(initialMovieForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Load dashboard data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analyticsData, usersData, moviesData] = await Promise.all([
        getAdminAnalytics().catch((err) => {
          console.error("Analytics fetch failed:", err);
          return null;
        }),
        getUsers().catch((err) => {
          console.error("Users fetch failed:", err);
          return [];
        }),
        fetchMovies({ genre: "All", search: "" }).catch((err) => {
          console.error("Movies fetch failed:", err);
          return [];
        }),
      ]);

      setAnalytics(analyticsData);
      setUsersList(usersData);
      setMoviesList(moviesData);
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Movie CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setMovieForm({
      ...initialMovieForm,
      poster: `https://picsum.photos/seed/${Date.now()}/400/560`,
      backdrop: `https://picsum.photos/seed/${Date.now()}bd/1280/500`,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || "",
      genre: movie.genre || "Action",
      year: movie.year || movie.releaseYear || 2024,
      rating: movie.rating || "7.0",
      duration: movie.duration || "120 min",
      poster: movie.poster || movie.posterUrl || "",
      backdrop: movie.backdrop || movie.backdropUrl || "",
      overview: movie.overview || "",
      googleDriveFileId: movie.googleDriveFileId || "",
      isTrending: Boolean(movie.isTrending),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMovieForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!movieForm.title.trim()) {
      setFormError("Movie title is required");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingMovie) {
        const updated = await updateMovie(editingMovie.id, movieForm);
        setMoviesList((prev) =>
          prev.map((m) => (m.id === editingMovie.id ? { ...m, ...updated } : m))
        );
        showNotification(`Movie "${movieForm.title}" updated successfully.`);
      } else {
        const created = await createMovie(movieForm);
        setMoviesList((prev) => [created, ...prev]);
        showNotification(`Movie "${movieForm.title}" added to catalogue.`);
      }
      handleCloseModal();
      // Refresh analytics in background
      getAdminAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      setFormError(err.message || "Failed to save movie");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteMovie = async (movie) => {
    const confirm = window.confirm(`Are you sure you want to delete "${movie.title}"?`);
    if (!confirm) return;

    try {
      await deleteMovie(movie.id);
      setMoviesList((prev) => prev.filter((m) => m.id !== movie.id));
      showNotification(`Movie "${movie.title}" deleted.`);
      getAdminAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to delete movie");
    }
  };

  // User Role Switcher
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "ADMIN" ? "USER" : "ADMIN";
    const confirm = window.confirm(
      `Change role for ${targetUser.name || targetUser.email} to ${newRole}?`
    );
    if (!confirm) return;

    try {
      const updated = await updateUserRole(targetUser.id, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: updated.role } : u))
      );
      showNotification(`Role for ${targetUser.name || targetUser.email} updated to ${newRole}.`);
      getAdminAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to update user role");
    }
  };

  // Filtered movies
  const filteredMovies = moviesList.filter((m) => {
    const matchesGenre = genreFilter === "All" || m.genre?.toLowerCase() === genreFilter.toLowerCase();
    const matchesSearch =
      !movieSearch || m.title?.toLowerCase().includes(movieSearch.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-page">
      <Header />

      <main className="admin-container container">
        {/* Banner */}
        <section className="admin-header">
          <div className="admin-header__info">
            <div className="admin-header__badge">
              <span className="admin-header__dot"></span> SYSTEM ADMINISTRATOR
            </div>
            <h1 className="admin-header__title">Admin Control Portal</h1>
            <p className="admin-header__subtitle">
              Manage movies catalogue, monitor viewership metrics, and govern platform user roles.
            </p>
          </div>
          <div className="admin-header__stats-quick">
            <div className="admin-quick-stat">
              <span className="admin-quick-stat__label">Total Users</span>
              <strong className="admin-quick-stat__val">{analytics?.totalUsers ?? usersList.length}</strong>
            </div>
            <div className="admin-quick-stat">
              <span className="admin-quick-stat__label">Catalogue Titles</span>
              <strong className="admin-quick-stat__val">{analytics?.totalMovies ?? moviesList.length}</strong>
            </div>
          </div>
        </section>

        {/* Notification Toast */}
        {notification && (
          <div className="admin-toast" role="status">
            <span>✓</span> {notification}
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="admin-error-banner" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Analytics & Overview
          </button>
          <button
            className={`admin-tab ${activeTab === "movies" ? "is-active" : ""}`}
            onClick={() => setActiveTab("movies")}
          >
            🎬 Movies Catalogue (CMS)
            <span className="admin-tab__counter">{moviesList.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === "users" ? "is-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 User Management
            <span className="admin-tab__counter">{usersList.length}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Analytics */}
        {activeTab === "overview" && (
          <div className="admin-section">
            <div className="admin-cards-grid">
              <div className="admin-card">
                <div className="admin-card__icon">👥</div>
                <div className="admin-card__title">Total Registered Users</div>
                <div className="admin-card__number">{analytics?.totalUsers ?? usersList.length}</div>
                <div className="admin-card__sub">
                  {analytics?.adminCount ?? 1} Admins • {analytics?.userCount ?? (usersList.length - 1)} Viewers
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card__icon">🎥</div>
                <div className="admin-card__title">Available Movies</div>
                <div className="admin-card__number">{analytics?.totalMovies ?? moviesList.length}</div>
                <div className="admin-card__sub">Streamable via Google Drive API</div>
              </div>

              <div className="admin-card">
                <div className="admin-card__icon">🔥</div>
                <div className="admin-card__title">Trending Titles</div>
                <div className="admin-card__number">
                  {analytics?.trendingMoviesCount ?? moviesList.filter((m) => m.isTrending).length}
                </div>
                <div className="admin-card__sub">Featured on home carousel</div>
              </div>

              <div className="admin-card">
                <div className="admin-card__icon">🏷️</div>
                <div className="admin-card__title">Genre Categories</div>
                <div className="admin-card__number">{analytics?.genres?.length ?? GENRES.length}</div>
                <div className="admin-card__sub">Active classification tags</div>
              </div>
            </div>

            {/* Genres Distribution */}
            {analytics?.genres && analytics.genres.length > 0 && (
              <div className="admin-panel">
                <h3 className="admin-panel__title">Catalogue Genre Distribution</h3>
                <div className="admin-genres-distribution">
                  {analytics.genres.map((g) => (
                    <div key={g.genre} className="admin-genre-pill">
                      <span className="admin-genre-pill__name">{g.genre}</span>
                      <span className="admin-genre-pill__count">{g.count} titles</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Registrations */}
            <div className="admin-panel">
              <h3 className="admin-panel__title">Recent User Registrations</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Assigned Role</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.slice(0, 5).map((u) => (
                      <tr key={u.id}>
                        <td className="admin-table__name-col">
                          <span className="admin-table__avatar">
                            {u.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                          <strong>{u.name}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`admin-role-badge admin-role-badge--${u.role?.toLowerCase()}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Movies CMS */}
        {activeTab === "movies" && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <div className="admin-toolbar__search-group">
                <input
                  type="text"
                  placeholder="Search titles in catalogue…"
                  className="admin-input admin-input--search"
                  value={movieSearch}
                  onChange={(e) => setMovieSearch(e.target.value)}
                />
                <select
                  className="admin-select"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                >
                  <option value="All">All Genres</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button className="admin-btn admin-btn--primary" onClick={handleOpenAddModal}>
                + Add New Movie
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Year</th>
                    <th>Rating</th>
                    <th>Duration</th>
                    <th>Trending</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="admin-table__empty">
                        No movies found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMovies.map((movie) => (
                      <tr key={movie.id}>
                        <td>
                          <img
                            src={movie.poster || movie.posterUrl}
                            alt={movie.title}
                            className="admin-table__poster"
                          />
                        </td>
                        <td>
                          <strong className="admin-table__movie-title">{movie.title}</strong>
                        </td>
                        <td>
                          <span className="admin-genre-tag">{movie.genre}</span>
                        </td>
                        <td>{movie.year || movie.releaseYear}</td>
                        <td>⭐ {movie.rating}</td>
                        <td>{movie.duration}</td>
                        <td>
                          {movie.isTrending ? (
                            <span className="admin-trending-badge">Trending 🔥</span>
                          ) : (
                            <span className="admin-standard-badge">Standard</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-action-btn admin-action-btn--edit"
                              onClick={() => handleOpenEditModal(movie)}
                              title="Edit Movie"
                            >
                              Edit
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => handleDeleteMovie(movie)}
                              title="Delete Movie"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === "users" && (
          <div className="admin-section">
            <div className="admin-toolbar">
              <input
                type="text"
                placeholder="Search registered users by name, email or role…"
                className="admin-input admin-input--search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="admin-users-summary">
                Showing {filteredUsers.length} of {usersList.length} users
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Watchlist Items</th>
                    <th>Member Since</th>
                    <th>Role Management</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-table__empty">
                        No users found matching "{userSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentUser = user && user.id === u.id;
                      return (
                        <tr key={u.id}>
                          <td className="admin-table__name-col">
                            <span className="admin-table__avatar">
                              {u.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                            <div>
                              <strong>{u.name}</strong>
                              {isCurrentUser && <span className="admin-you-tag"> (You)</span>}
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className={`admin-role-badge admin-role-badge--${u.role?.toLowerCase()}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>{u._count?.watchLater ?? 0} saved</td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            {isCurrentUser ? (
                              <span className="admin-action-disabled">Self (Locked)</span>
                            ) : (
                              <button
                                className={`admin-btn-toggle-role ${
                                  u.role === "ADMIN" ? "is-admin" : "is-user"
                                }`}
                                onClick={() => handleToggleRole(u)}
                              >
                                Switch to {u.role === "ADMIN" ? "USER" : "ADMIN"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Movie Form Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">
                {editingMovie ? `Edit "${editingMovie.title}"` : "Add New Movie"}
              </h2>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            {formError && <div className="admin-modal__error">{formError}</div>}

            <form className="admin-modal__form" onSubmit={handleSaveMovie}>
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={movieForm.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Interstellar"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Genre *</label>
                  <select name="genre" value={movieForm.genre} onChange={handleFormChange}>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row admin-form-row--3">
                <div className="admin-form-field">
                  <label>Release Year</label>
                  <input
                    type="number"
                    name="year"
                    value={movieForm.year}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Rating (0.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    value={movieForm.rating}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="admin-form-field">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={movieForm.duration}
                    onChange={handleFormChange}
                    placeholder="120 min"
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label>Poster Image URL</label>
                <input
                  type="url"
                  name="poster"
                  value={movieForm.poster}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-field">
                <label>Backdrop Banner URL</label>
                <input
                  type="url"
                  name="backdrop"
                  value={movieForm.backdrop}
                  onChange={handleFormChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-field">
                <label>Google Drive Video File ID or Link</label>
                <input
                  type="text"
                  name="googleDriveFileId"
                  value={movieForm.googleDriveFileId}
                  onChange={handleFormChange}
                  placeholder="1eFgHiJkLmNoPqRsTuVwXyZ0123456789"
                />
              </div>

              <div className="admin-form-field">
                <label>Overview / Synopsis</label>
                <textarea
                  name="overview"
                  rows="3"
                  value={movieForm.overview}
                  onChange={handleFormChange}
                  placeholder="Brief synopsis..."
                ></textarea>
              </div>

              <div className="admin-form-field admin-form-field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={movieForm.isTrending}
                    onChange={handleFormChange}
                  />
                  <span>Feature in Trending Carousel</span>
                </label>
              </div>

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Saving…" : editingMovie ? "Update Movie" : "Create Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
