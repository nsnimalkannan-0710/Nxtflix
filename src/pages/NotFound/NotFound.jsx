import { Link } from "react-router-dom";
import "./index.css";

function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found__code">404</h1>
      <h2 className="not-found__title">Page Not Found</h2>
      <p className="not-found__text">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="not-found__link">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
