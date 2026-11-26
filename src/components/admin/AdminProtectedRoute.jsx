import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const admin = useSelector(function (state) {
    return state.adminAuth.admin;
  });

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
