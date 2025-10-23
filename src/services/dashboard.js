// services/dashboard.js
import axiosInstance from "./axiosInstance";

// Fetch dashboard statistics
export const fetchDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/applicants/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Promise.reject(error);
  }
};

// Fetch dashboard statistics for a specific date range
export const fetchDashboardStatsByDateRange = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/applicants/stats", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats by date range:", error);
    return Promise.reject(error);
  }
};

// Fetch recent activity
export const fetchRecentActivity = async (limit = 10) => {
  try {
    const response = await axiosInstance.get("/applicants/recent-activity", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return Promise.reject(error);
  }
};
