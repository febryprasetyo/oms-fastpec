import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TAuthStore } from "./type";
import { login } from "../api/login";
import { deleteCookie, setCookie } from "cookies-next";
import { toast } from "@/components/ui/use-toast";
import { useStoreCSR } from "@/lib/useStoreCSR";

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      doLogin: async ({ username, password }) => {
        try {
          const res = await login({ username, password });
          if (res?.data?.success) {
            set(() => ({ user: res.data }));
            setCookie("token", res?.data?.token?.access_token);
            toast({
              title: "Success",
              description: "Login Berhasil",
              duration: 3000,
            });
          }
        } catch (error) {
          throw error;
        }

        return;
      },
      doLogout: async () => {
        set(() => ({ user: null }));
        deleteCookie("token");
      },
    }),
    { name: "auth-storage" },
  ),
);

export const useAuthStoreCSR = () =>
  useStoreCSR(useAuthStore, (state) => state);

export const useExpandedStore = create<Expanded>((set) => ({
  isExpanded: true,
  setExpanded: (isExpanded) => set({ isExpanded: isExpanded }),
}));
