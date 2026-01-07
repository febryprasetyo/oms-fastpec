// hooks / useKlhkList.ts;
import { useEffect, useState } from "react";
import { getKlhkList } from "@/services/api/database";

import { useAuthStore } from "@/services/store";

export const useKlhkList = (cookie: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const token = accessToken || cookie;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getKlhkList({ cookie: token, limit: "10", page: "1" });
        if (res?.data) {
          const parsed = res.data.map((item: any) => {
            try {
              const payload = JSON.parse(item.payload);
              return payload.data;
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
          setData(parsed);
        }
      } catch (error) {
        console.error("Failed to fetch KLHK list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { data, loading };
};
