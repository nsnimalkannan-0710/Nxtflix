import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated -> skip login
  if (Cookies.get("jwt_token")) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__brand">
        <h1 className="login__logo">
          NXT<span>FLIX</span>
        </h1>
        <p className="login__tagline">
          Unlimited movies, shows and more. Watch anywhere. Cancel anytime.
        </p>
      </div>

      <div className="login__form-panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <h2 className="login__title">Sign In</h2>

          {error && <div className="login__error">{error}</div>}

          <label className="login__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />

          <label className="login__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button className="login__submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "var(--color-text-muted)" }}>
            <span>New to NxtFlix?</span>{" "}
            <Link to="/signup" style={{ color: "#fff", fontWeight: "600", textDecoration: "underline", marginLeft: "4px" }}>
              Sign up now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
