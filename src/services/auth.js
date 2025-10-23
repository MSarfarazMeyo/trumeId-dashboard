import { LOCAL_STORAGE } from "../lib/constants";
import axiosInstance from "./axiosInstance";

export const loginAdmin = async (values) => {
  const { email, password } = values;

  const { data } = await axiosInstance.post("/auth/login/admin", {
    email,
    password,
  });
  return data;
};

export const loginClient = async (values) => {
  const { email, password } = values;

  const { data } = await axiosInstance.post("/auth/login/client", {
    email,
    password,
  });
  return data;
};

export const getClientProfile = async () => {
  const { data } = await axiosInstance.get("/clients/profile");
  return data;
};

export const getAdminProfile = async () => {
  const { data } = await axiosInstance.get("/admin/profile");
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem(LOCAL_STORAGE.TOKEN_KEY);
  localStorage.removeItem(LOCAL_STORAGE.ROLE);

  window.location.href = "/login";
};

export const isAdminAuthenticated = () => {
  return (
    !!localStorage.getItem(LOCAL_STORAGE.TOKEN_KEY) &&
    !!localStorage.getItem(LOCAL_STORAGE.ROLE)
  );
};
