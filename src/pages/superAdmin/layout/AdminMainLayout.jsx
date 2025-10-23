import { Outlet, useLocation } from "react-router";
import AdminSidebarLayout from "./AdminSidebarLayout";
import AdminHeaderLayout from "./AdminHeaderLayout";

const AdminMainLayout = () => {
  const location = useLocation();

  // Define routes that should use sidebar layout (dashboard pages)
  const sidebarRoutes = [
    "/admin", // dashboard home
    "/admin/dashboard",
    "/admin/overview",
  ];

  // Check if current route should use sidebar layout
  const useSidebarLayout = sidebarRoutes.includes(location.pathname);

  return useSidebarLayout ? <AdminSidebarLayout /> : <AdminHeaderLayout />;
};

export default AdminMainLayout;
