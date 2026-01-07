import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/services/store";
import { isServer } from "@tanstack/react-query";
import axios, { AxiosError, AxiosInstance } from "axios";
import { deleteCookie } from "cookies-next";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 6000000,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    if (!isServer) {
      if (
        error?.response?.status === 401 &&
        error?.response?.data?.message == "Access token expired or invalid"
      ) {
        useAuthStore.getState().doLogout();
        deleteCookie("token");

        toast({
          title: "Unauthorized",
          variant: "destructive",
          description: "Silahkan Login Untuk Melanjutkan",
        });

        return;
      }
    }

    toast({
      title: "Error",
      variant: "destructive",
      description: error?.response?.data?.message || "Terjadi Kesalahan",
    });
    return Promise.reject(error);
  },
);
