import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useWatchLater } from "../../context/WatchLaterContext";
import "./index.css";

function Header() {
  const navigate = useNavigate();
  const { watchLater } = useWatchLater();

  const handleLogout = () => {
    Cookies.remove("jwt_token");
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header__inner container">
        <Link to="/" className="app-header__logo">
          NXTFLIX
        </Link>

        <nav className="app-header__nav">
          <Link to="/" className="app-header__link">
            Home
          </Link>
          <Link to="/watch-later" className="app-header__link">
            Watch Later
            {watchLater.length > 0 && (
              <span className="app-header__badge">{watchLater.length}</span>
            )}
          </Link>
          <button className="app-header__logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
