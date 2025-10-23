// services/adminServices.js
import axiosInstance from "./axiosInstance";

// ============ CLIENT MANAGEMENT ============

// Fetch all clients with filtering and pagination
export const fetchClients = async (params) => {
  try {
    const response = await axiosInstance.get("/clients", { params });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get client details by ID
export const getClientDetails = async (clientId) => {
  try {
    const response = await axiosInstance.get(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create new client
export const createClient = async (clientData) => {
  if (!clientData) {
    return Promise.reject(new Error("Client data required"));
  }
  try {
    const response = await axiosInstance.post("/clients", clientData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update client
export const updateClient = async (clientId, clientData) => {
  try {
    const response = await axiosInstance.patch(
      `/clients/${clientId}`,
      clientData
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete client
export const deleteClient = async (clientId) => {
  try {
    const response = await axiosInstance.delete(`/clients/${clientId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Toggle client status (activate/deactivate)
export const toggleClientStatus = async (clientId) => {
  try {
    const response = await axiosInstance.patch(
      `/clients/${clientId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get OAuth credentials for client (client_id only)
export const getOAuthCredentials = async (clientId) => {
  try {
    const response = await axiosInstance.get(`/clients/${clientId}/oauth-credentials`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Regenerate OAuth credentials
export const regenerateOAuthCredentials = async (clientId) => {
  try {
    const response = await axiosInstance.post(`/clients/${clientId}/regenerate-oauth`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// ============ SUBSCRIPTION PLAN MANAGEMENT ============

// Fetch all subscription plans
export const fetchSubscriptionPlans = async () => {
  try {
    const response = await axiosInstance.get("/plans");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get specific plan details
export const getPlanDetails = async (planName) => {
  try {
    const response = await axiosInstance.get(`/plans/${planName}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create new plan
export const createPlan = async (planData) => {
  try {
    const response = await axiosInstance.post("/plans", planData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update plan
export const updatePlan = async (planName, planData) => {
  try {
    const response = await axiosInstance.put(`/plans/${planName}`, planData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete plan
export const deletePlan = async (planName) => {
  try {
    const response = await axiosInstance.delete(`/plans/${planName}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// ============ ANALYTICS & REPORTING ============

// Get dashboard analytics
export const getDashboardAnalytics = async (dateRange) => {
  try {
    const response = await axiosInstance.get("/admin/analytics/dashboard", {
      params: dateRange,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get client usage statistics
export const getClientUsageStats = async (clientId, dateRange) => {
  try {
    const response = await axiosInstance.get(
      `/admin/analytics/client/${clientId}`,
      {
        params: dateRange,
      }
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get system-wide verification statistics
export const getVerificationStats = async (dateRange) => {
  try {
    const response = await axiosInstance.get("/admin/analytics/verifications", {
      params: dateRange,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// ============ SYSTEM MANAGEMENT ============

// Get system settings
export const getSystemSettings = async () => {
  try {
    const response = await axiosInstance.get("/admin/settings");
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axiosInstance.put("/admin/settings", settings);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get audit logs
export const getAuditLogs = async (params) => {
  try {
    const response = await axiosInstance.get("/admin/audit-logs", { params });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// ============ ADMIN MANAGEMENT ============

// Fetch all admins
export const fetchAdmins = async (params) => {
  try {
    const response = await axiosInstance.get("/admin/admins", { params });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create new admin
export const createAdmin = async (adminData) => {
  try {
    const response = await axiosInstance.post("/admin/admins", adminData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update admin
export const updateAdmin = async (adminId, adminData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/admins/${adminId}`,
      adminData
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete admin
export const deleteAdmin = async (adminId) => {
  try {
    const response = await axiosInstance.delete(`/admin/admins/${adminId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Reset admin password
export const resetAdminPassword = async (adminId) => {
  try {
    const response = await axiosInstance.post(
      `/admin/admins/${adminId}/reset-password`
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
