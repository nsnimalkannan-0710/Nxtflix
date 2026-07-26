import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { signIn, extractToken } from "../../api/auth";
import "./index.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (Cookies.get("jwt_token")) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn(email, password);

      const token = extractToken(result);

      if (!token) {
        throw new Error("Invalid Credentials");
      }

      Cookies.set("jwt_token", token, {
        expires: 7,
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
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
          Unlimited movies, shows and more. Watch
          <br />
          anywhere. Cancel anytime.
        </p>
      </div>

      <div className="login__form-panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <h2 className="login__title">Sign In</h2>

          {error && <div className="login__error">{error}</div>}
          <br />
          
          <label htmlFor="email" className="login__label">
            Email
          </label>

          <input
            id="email"
            className="login__input"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="login__label">
            Password
          </label>

          <input
            id="password"
            className="login__input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="login__submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;