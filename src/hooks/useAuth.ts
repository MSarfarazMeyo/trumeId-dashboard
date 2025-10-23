// src/services/admin.ts

import { useMutation } from "@tanstack/react-query";
import { isAdminAuthenticated, loginAdmin, loginClient, logoutUser } from "../services/auth";






export const useAdminLogin = () => {
    return useMutation({
        mutationFn: (credentials) => loginAdmin(credentials),
    });
};

export const useClientLogin = () => {
    return useMutation({
        mutationFn: (credentials) => loginClient(credentials),
    });
};



export const useIsAdminAuthenticated = () => {
    return { isAuthenticated: isAdminAuthenticated() };
};


export const useLogout = () => {
    const logout = () => {
        logoutUser();
    };

    return { logout };
};

