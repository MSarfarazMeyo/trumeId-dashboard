import axiosInstance from "./axiosInstance";

// Fetch applicants with filtering and pagination
export const fetchApplicants = async (params) => {
  try {
    const response = await axiosInstance.get("/applicants", { params });
    return response.data; // Should include { applicants, totalPages }
  } catch (error) {
    return Promise.reject(error);
  }
};

// Get applicant details by ID
export const getApplicantDetails = async (applicantId) => {
  try {
    const response = await axiosInstance.get(`/applicants/${applicantId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Create new applicant
export const createApplicantService = async (applicantBody) => {
  if (!applicantBody) {
    return Promise.reject(new Error("Applicant data required"));
  }

  try {
    const response = await axiosInstance.post("/applicants", applicantBody);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Update applicant
export const updateApplicantService = async (applicantId, updateData) => {
  if (!applicantId) {
    return Promise.reject(new Error("Applicant ID required"));
  }

  try {
    const response = await axiosInstance.patch(
      `/applicants/${applicantId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteApplicantService = async (applicantId) => {
  if (!applicantId) {
    return Promise.reject(new Error("Applicant ID required"));
  }

  try {
    const response = await axiosInstance.delete(`/applicants/${applicantId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const createOrUpdateVerificationResult = async (
  verificationResultData
) => {
  const { data } = await axiosInstance.post(
    "/verification-results",
    verificationResultData
  );
  return data;
};
