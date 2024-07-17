import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import { TAuthStore } from "./type";
import { login } from "../api/login";
import { deleteCookie, setCookie } from "cookies-next";
import { toast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      doLogin: async ({ username, password }) => {
        try {
          const res = await login({ username, password });
          if (res?.data?.success) {
            set(() => ({ user: res.data }));
            setCookie("token", res?.data?.token?.access_token, {
              expires: new Date(new Date().getTime() + 60 * 60 * 1000),
            });
            toast({
              title: "Success",
              description: "Login Berhasil",
              duration: 3000,
            });
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            toast({
              title: "Error",
              description: error?.response?.data?.message,
              duration: 3000,
              variant: "destructive",
            });
          }
        }

        return;
      },
      doLogout: async () => {
        set(() => ({ user: null }));
        deleteCookie("token");
      },
    }),

    {
      name: "auth-storage",
      storage: {
        getItem: (name: string) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key: string, value: StorageValue<TAuthStore>) =>
          localStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key: string) => localStorage.removeItem(key),
      },
    },
  ),
);

export const useExpandedStore = create<Expanded>((set) => ({
  isExpanded: true,
  setExpanded: (isExpanded) => set({ isExpanded: isExpanded }),
}));
