import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  //  Not logged in
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  //  Wrong role
  if (!allowedRoles.includes(role)) {
    alert("It is for internal use only");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;