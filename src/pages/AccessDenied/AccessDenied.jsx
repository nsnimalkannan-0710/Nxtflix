import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

function AccessDenied() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSwitchAccount = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="access-denied">
      <div className="access-denied__container">
        <div className="access-denied__badge">HTTP 403</div>
        <div className="access-denied__icon" aria-hidden="true">
          🛡️
        </div>
        <h1 className="access-denied__title">Access Denied</h1>
        <p className="access-denied__desc">
          You do not have administrative privileges to access this area. The Admin Dashboard is restricted to authorized administrator accounts.
        </p>

        {user && (
          <div className="access-denied__user-info">
            <span>Signed in as:</span>
            <strong>{user.email}</strong>
            <span className="access-denied__role-tag">Role: {user.role || "USER"}</span>
          </div>
        )}

        <div className="access-denied__actions">
          <Link to="/" className="access-denied__btn access-denied__btn--primary">
            Return to Browse
          </Link>
          <button
            onClick={handleSwitchAccount}
            className="access-denied__btn access-denied__btn--secondary"
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
