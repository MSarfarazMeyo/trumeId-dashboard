import { Outlet, useLocation } from "react-router";
import ClientSidebarLayout from "./ClientSidebarLayout";
import ClientHeaderLayout from "./ClientHeaderLayout";

const ClientMainLayout = () => {
  const location = useLocation();

  // Define routes that should use sidebar layout (dashboard pages)
  const sidebarRoutes = [
    "/client", // dashboard home
    "/client/dashboard",
    "/client/overview",
  ];

  // Check if current route should use sidebar layout
  const useSidebarLayout = sidebarRoutes.includes(location.pathname);

  return useSidebarLayout ? <ClientSidebarLayout /> : <ClientHeaderLayout />;
};

export default ClientMainLayout;
