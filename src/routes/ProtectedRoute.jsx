import { Navigate } from "react-router";
import { useContext } from "react";
import appContext from "../context/appContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(appContext);

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
