import { axiosInstance } from "@/lib/axiosInstance";

export type NotificationCategory = 'connectivity' | 'quality' | 'calibration' | 'maintenance' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export type Notification = {
  id: number;
  category?: NotificationCategory;
  type: string;
  severity?: NotificationSeverity;
  title?: string;
  uuid?: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  metadata?: any;
  target_role?: string;
  is_read: boolean;
  created_by: string;
  created_at: string;
};

export interface NotificationListResponse {
  status?: { code: number; description: string };
  success?: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
    limit: number;
    offset: number;
  };
}

export const getNotifications = async (
  accessToken: string,
  limit = 20,
  offset = 0,
  category?: string,
  unreadOnly?: boolean
): Promise<NotificationListResponse> => {
  let url = `/api/data/notifications?limit=${limit}&offset=${offset}`;
  if (category && category !== 'all') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  if (unreadOnly) {
    url += `&unread_only=true`;
  }
  const res = await axiosInstance.get(url, {
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
