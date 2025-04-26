import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default PrivateRoute; 