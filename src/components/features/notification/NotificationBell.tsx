"use client";
import React, { useEffect, useState } from "react";
import { BellIcon, CheckCircle2, History, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/services/store";
import { getNotifications, markAsRead, markAllAsRead, Notification } from "@/services/api/notification";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";
import { toast } from "@/components/ui/use-toast";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await getNotifications(token);
      if (res.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // WS Connection for real-time notifications
    let socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      socketBaseUrl?.startsWith("ws://")
    ) {
      socketBaseUrl = socketBaseUrl.replace("ws://", "wss://");
    }

    // Connect to root for notifications
    const wsUrl = `${socketBaseUrl}/`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'notification') {
            const newNotif = message.data;

            setNotifications(prev => {
              if (prev.some(n => n.id === newNotif.id)) return prev;

              // Only increment unread count if it's truly a new notification
              // Use separate effect or handle after state update
              return [newNotif, ...prev].slice(0, 50);
            });

            // Update unread count and show toast outside of setNotifications
            setUnreadCount(count => count + 1);
            toast({
              title: "Notifikasi Baru",
              description: newNotif.message,
            });
          }
        } catch (error) {
          console.error("WS notification parse error", error);
        }
      };
      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws) {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token]);

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    try {
      await markAsRead(token, id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <History className="h-4 w-4 text-amber-500" />;
      case 'logbook': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <BellIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="text-sm font-semibold">Notifikasi</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[11px] font-medium text-blue-600 hover:text-blue-700"
              onClick={handleMarkAllRead}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border-b p-3 transition-colors hover:bg-slate-50",
                  !notif.is_read && "bg-blue-50/50"
                )}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              >
                <div className="mt-0.5 rounded-full bg-white p-1 shadow-sm">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={cn("text-xs leading-relaxed", !notif.is_read ? "font-semibold text-slate-900" : "text-slate-600")}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {moment(notif.created_at).fromNow()}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
