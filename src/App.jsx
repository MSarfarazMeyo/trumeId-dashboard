import { Navigate, Route, Routes } from "react-router";
import Login from "./pages/Login";
import DashboardRouter from "./routes/DashboardRouter";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useContext } from "react";
import appContext from "./context/appContext";
import { Spin } from "antd";
import Home from "./pages/superAdmin/Home";
import ClientManagement from "./pages/superAdmin/Client";
import PlansManagement from "./pages/superAdmin/Plans";
import Dashboard from "./pages/client/Dashboard";
import ClientMainLayout from "./pages/client/layout/ClientMainLayout";
import ApplicantsTable from "./pages/client/applicants/ApplicantsTable";
import RiskTable from "./pages/client/applicants/RiskTable";
import SanctionAmlTable from "./pages/client/applicants/SanctionAmlTable";
import ApplicantDetailPage from "./pages/client/applicants/ApplicantDetailPage";
import Settings from "./pages/client/Settings";
import SuperAdminSettings from "./pages/superAdmin/Settings";

import ActivityComingSoon from "./pages/client/Activity";
import AdminMainLayout from "./pages/superAdmin/layout/AdminMainLayout";
import FlowsTable from "./pages/client/applicants/FlowsTable";

function App() {
  const { loading } = useContext(appContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminMainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="clients" element={<ClientManagement />} />
        <Route path="plans" element={<PlansManagement />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientMainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<ApplicantsTable />} />
        <Route path="flows" element={<FlowsTable />} />

        <Route path="users/:id" element={<ApplicantDetailPage />} />

        <Route path="aml-sanctions" element={<SanctionAmlTable />} />
        <Route path="risk-fraud" element={<RiskTable />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin-profile" element={<Settings />} />
        <Route path="activity" element={<ActivityComingSoon />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
