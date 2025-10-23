import React, { useEffect, useState } from "react";
import appContext from "./appContext";
import { useIsAdminAuthenticated, useLogout } from "../hooks/useAuth";
import { LOCAL_STORAGE } from "../lib/constants";
import { getAdminProfile, getClientProfile } from "../services/auth";

const AppStateContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useIsAdminAuthenticated();
  const { logout } = useLogout();

  const fetchUser = async () => {
    try {
      setLoading(true);

      let data;

      if (localStorage.getItem(LOCAL_STORAGE.ROLE) == "admin") {
        data = await getAdminProfile();
      }
      if (localStorage.getItem(LOCAL_STORAGE.ROLE) == "client") {
        data = await getClientProfile();
      }

      if (data?.user) {
        setUser(data.user);
        setLoading(false);
      } else {
        setLoading(false);

        logout();
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const refetchUserProfile = async () => {
    try {
      let data;
      if (localStorage.getItem(LOCAL_STORAGE.ROLE) == "admin") {
        data = await getAdminProfile();
      }
      if (localStorage.getItem(LOCAL_STORAGE.ROLE) == "client") {
        data = await getClientProfile();
      }
      if (data?.user) {
        setUser(data.user);
        setLoading(false);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, []);

  console.log("user", user);

  return (
    <appContext.Provider
      value={{
        user,
        setUser,
        loading,
        refetchUserProfile,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export { appContext, AppStateContext };
