import axiosInstance from "./axiosInstance";

// Function to create or update a verification result

export const getVerificationResultByIdandType = async (
  applicantId,
  verificationType
) => {
  const { data } = await axiosInstance.get(
    `/verification-results/by-type/${applicantId}/${verificationType}`
  );

  return data;
};

// Function to get all verification results
export const getAllVerificationResults = async () => {
  const { data } = await axiosInstance.get("/verification-results");
  return data;
};

// Function to get a specific verification result by ID
export const getVerificationResultById = async (id) => {
  const { data } = await axiosInstance.get(`/verification-results/${id}`);
  return data;
};

// Function to update a specific verification result by ID
export const updateVerificationResultById = async (id, updateData) => {
  const { data } = await axiosInstance.patch(
    `/verification-results/${id}`,
    updateData
  );
  return data;
};

// Function to delete a verification result by ID
export const deleteVerificationResultById = async (id) => {
  const { data } = await axiosInstance.delete(`/verification-results/${id}`);
  return data;
};
