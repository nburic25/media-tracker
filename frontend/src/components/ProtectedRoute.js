import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useContext(AuthContext);

  console.log("USER:", user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && Number(user.role_id) !== 1) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;