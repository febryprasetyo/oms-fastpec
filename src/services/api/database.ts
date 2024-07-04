import { axiosInstance } from "@/lib/axiosInstance";

export const getDatabaseList = async (accessToken: string) => {
  const res = await axiosInstance.get<DatabaseResponse>(`/api/data/klhk/list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data;
};
