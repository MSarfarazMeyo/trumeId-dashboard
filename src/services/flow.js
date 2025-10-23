// flowServices.js
import axiosInstance from "./axiosInstance";

// Create new flow
export const createFlowService = async (flowBody) => {
  if (!flowBody) {
    return Promise.reject(new Error("Flow data is required"));
  }
  try {
    const response = await axiosInstance.post("/flows", flowBody);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get all flows for the current client (with pagination)
export const fetchClientFlows = async (page = 1, searchText = "") => {
  let limit = 10;
  try {
    const response = await axiosInstance.get("/flows", {
      params: { page, limit, searchText },
    });
    return response.data; // { flows, total }
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get flow by ID
export const getFlowByIdService = async (flowId) => {
  if (!flowId) {
    return Promise.reject(new Error("Flow ID is required"));
  }
  try {
    const response = await axiosInstance.get(`/flows/${flowId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update flow (PATCH)
export const updateFlowService = async (updateData) => {
  const { id: flowId, ...restData } = updateData;
  if (!flowId) {
    return Promise.reject(new Error("Flow ID is required"));
  }
  try {
    const response = await axiosInstance.patch(`/flows/${flowId}`, restData);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Delete flow
export const deleteFlowService = async (flowId) => {
  if (!flowId) {
    return Promise.reject(new Error("Flow ID is required"));
  }
  try {
    await axiosInstance.delete(`/flows/${flowId}`);
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};
