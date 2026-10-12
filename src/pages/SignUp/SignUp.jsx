import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import "./index.css";

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to home
  if (Cookies.get("jwt_token")) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validatePasswordRules = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      return "Password must contain at least one special character (e.g. !@#$%)";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const pwdError = validatePasswordRules(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);
      // Automatically logged in and token set by AuthContext
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasMinLen = formData.password.length >= 8;
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);

  return (
    <div className="signup">
      <div className="signup__brand">
        <h1 className="signup__logo">
          NXT<span>FLIX</span>
        </h1>
        <p className="signup__tagline">
          Join NxtFlix today. Watch unlimited movies and shows anywhere, anytime.
        </p>
      </div>

      <div className="signup__form-panel">
        <form className="signup__form" onSubmit={handleSubmit} noValidate>
          <h2 className="signup__title">Create Account</h2>

          {error && (
            <div className="signup__error" role="alert">
              <span className="signup__error-icon">⚠️</span> {error}
            </div>
          )}

          <div className="signup__field">
            <label className="signup__label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="signup__input"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="signup__input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="signup__input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="signup__hints">
                <span className={`signup__hint-item ${hasMinLen ? "is-valid" : ""}`}>
                  {hasMinLen ? "✓" : "•"} 8+ chars
                </span>
                <span className={`signup__hint-item ${hasNumber ? "is-valid" : ""}`}>
                  {hasNumber ? "✓" : "•"} 1 number
                </span>
                <span className={`signup__hint-item ${hasSpecial ? "is-valid" : ""}`}>
                  {hasSpecial ? "✓" : "•"} 1 special char
                </span>
              </div>
            )}
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="signup__input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button className="signup__submit" type="submit" disabled={loading}>
            {loading ? "Creating Account…" : "Sign Up"}
          </button>

          <div className="signup__footer">
            <span>Already have an account?</span>{" "}
            <Link to="/login" className="signup__link">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
