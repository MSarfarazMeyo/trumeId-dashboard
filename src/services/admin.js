import axiosInstance from "./axiosInstance";

export const fetchDashboardStatistics = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/statistics");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats by date range:", error);
    return Promise.reject(error);
  }
};
