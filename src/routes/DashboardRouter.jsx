import { Navigate } from "react-router";
import { LOCAL_STORAGE } from "../lib/constants";

const DashboardRouter = () => {
  const role = localStorage.getItem(LOCAL_STORAGE.ROLE);

  if (role === "admin") {
    return <Navigate to="/admin" />;
  } else if (role === "client") {
    return <Navigate to="/client" />;
  }

  return <Navigate to="/login" />;
};

export default DashboardRouter;
