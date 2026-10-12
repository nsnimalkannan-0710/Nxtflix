import { Link, useNavigate } from "react-router-dom";
import { useWatchLater } from "../../context/WatchLaterContext";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

function Header() {
  const navigate = useNavigate();
  const { watchLater } = useWatchLater();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header__inner container">
        <Link to="/" className="app-header__logo">
          NXT<span>FLIX</span>
        </Link>

        <nav className="app-header__nav">
          {isAuthenticated ? (
            <>
              <Link to="/" className="app-header__link">
                Home
              </Link>
              <Link to="/watch-later" className="app-header__link">
                Watch Later
                {watchLater.length > 0 && (
                  <span className="app-header__badge">{watchLater.length}</span>
                )}
              </Link>

              {isAdmin && (
                <Link to="/admin" className="app-header__link app-header__link--admin">
                  <span className="app-header__admin-icon" aria-hidden="true">⚙️</span>
                  Admin Dashboard
                  <span className="app-header__admin-pill">ADMIN</span>
                </Link>
              )}

              <div className="app-header__user-pill" title={`Logged in as ${user?.name || user?.email}`}>
                <span className="app-header__avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="app-header__username">{user?.name || user?.email?.split("@")[0]}</span>
              </div>

              <button className="app-header__logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="app-header__link">
                Sign In
              </Link>
              <Link to="/signup" className="app-header__signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
