import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "../pages/AccessDenied/AccessDenied";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, token, loading } = useAuth();
  const currentToken = token || Cookies.get("jwt_token");

  if (!currentToken) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  return children;
}

export default ProtectedRoute;
