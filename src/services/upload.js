import axiosInstance from "./axiosInstance";

/**
 * Uploads a file to S3 through backend API.
 * @returns {Promise<Object>} - S3UploadResult with { key, url, bucket }
 */
export const uploadFileToS3 = async ({ file }) => {
  try {
    console.log("working3");

    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/upload/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    return Promise.reject(
      error.response?.data?.message || "File upload failed"
    );
  }
};
