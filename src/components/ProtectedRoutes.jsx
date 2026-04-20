import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // No token
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Validate token structure + expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/admin/login" replace />;
    }

  } catch (err) {
    localStorage.clear();
    return <Navigate to="/admin/login" replace />;
  }

  // Wrong role
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;