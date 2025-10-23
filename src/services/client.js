import axiosInstance from "./axiosInstance";

export const updateClient = async (dataObj) => {
  const { data } = await axiosInstance.patch("/clients/profile", dataObj);
  return data;
};
