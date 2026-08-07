import { axiosInstance } from "@/lib/axiosInstance";

export type Notification = {
  id: number;
  type: 'offline' | 'maintenance' | 'logbook';
  uuid: string;
  message: string;
  is_read: boolean;
  created_by: string;
  created_at: string;
};

export const getNotifications = async (accessToken: string, limit = 20, offset = 0) => {
  const res = await axiosInstance.get(`/api/data/notifications?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
};

export const markAsRead = async (accessToken: string, id: number) => {
  const res = await axiosInstance.post(
    `/api/data/notifications/read`,
    { id },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
};

export const markAllAsRead = async (accessToken: string) => {
  const res = await axiosInstance.post(
    `/api/data/notifications/read-all`,
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
};
