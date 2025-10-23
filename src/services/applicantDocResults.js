import axiosInstance from "./axiosInstance";

// Get applicant details by ID
export const getApplicantFulDetails = async (applicantId) => {
  try {
    const response = await axiosInstance.get(
      `/applicants/withAllDetails/${applicantId}`
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
