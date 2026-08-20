"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  BellIcon,
  CheckCircle2,
  History,
  AlertCircle,
  AlertTriangle,
  FileCheck2,
  Wrench,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import Link from "next/link";

function playAlertChime(severity: string) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (severity === "critical") {
      // Urgent double beep
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.15); // D5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Gentle chime
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // AudioContext autoplay might be blocked before first user gesture
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token;
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getNotifications(token, 20, 0);
      if (res?.success || res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (error) {
      console.error("[NOTIFICATION-BELL] Failed to fetch notifications", error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();

    let socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      socketBaseUrl?.startsWith("ws://")
    ) {
      socketBaseUrl = socketBaseUrl.replace("ws://", "wss://");
    }

    const wsUrl = `${socketBaseUrl}/`;
    let reconnectTimeout: NodeJS.Timeout;
    let isSubscribed = true;

    const connect = () => {
      if (!isSubscribed) return;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // Subscribe to notifications channel & authenticate
          if (token) {
            ws.send(JSON.stringify({ type: "auth", token }));
          }
          ws.send(JSON.stringify({ type: "subscribe", channels: ["notifications"] }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "notification" && message.data) {
              const newNotif: Notification = message.data;

              setNotifications((prev) => {
                const alreadyExists = prev.some((n) => n.id === newNotif.id);
                if (alreadyExists) return prev;

                // Safely update unread count only for brand new items
                setUnreadCount((count) => count + 1);

                // Play sound
                playAlertChime(newNotif.severity || "info");

                // Show toast with action
                toast({
                  title: newNotif.title || "Notifikasi Baru",
                  description: newNotif.message,
                });

                return [newNotif, ...prev].slice(0, 50);
              });
            }
          } catch (err) {
            console.error("[NOTIFICATION-BELL] Error parsing WS message", err);
          }
        };

        ws.onclose = () => {
          if (isSubscribed) {
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.error("[NOTIFICATION-BELL] WS connection error", err);
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token, fetchNotifications]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!token) return;

    if (!notif.is_read) {
      try {
        await markAsRead(token, notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("[NOTIFICATION-BELL] Failed to mark as read", error);
      }
    }

    setIsOpen(false);

    // Interactive navigation
    if (notif.action_url) {
      router.push(notif.action_url);
    } else if (notif.uuid) {
      router.push(`/monitoring/${notif.uuid}`);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: "Berhasil",
        description: "Semua notifikasi telah ditandai sebagai dibaca",
      });
    } catch (error) {
      console.error("[NOTIFICATION-BELL] Failed to mark all as read", error);
    }
  };

  const getIcon = (type: string, severity?: string) => {
    if (severity === "critical" || type === "offline" || type === "station_offline") {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (severity === "warning" || type === "threshold_exceeded" || type === "calibration_rejected") {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    if (severity === "success" || type === "online" || type === "station_online" || type === "calibration_approved") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
    if (type === "maintenance") {
      return <Wrench className="h-4 w-4 text-amber-500" />;
    }
    if (type === "logbook") {
      return <History className="h-4 w-4 text-indigo-500" />;
    }
    if (type?.startsWith("calibration")) {
      return <FileCheck2 className="h-4 w-4 text-blue-500" />;
    }
    return <BellIcon className="h-4 w-4 text-blue-500" />;
  };

  const getSeverityBadgeClass = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/20 transition-all"
          aria-label="Pusat Notifikasi"
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-md animate-in zoom-in",
                unreadCount > 0 ? "bg-red-500 ring-2 ring-white/30" : "bg-blue-500"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-88 sm:w-96 p-0 shadow-2xl border-slate-200 rounded-xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50/80 rounded-t-xl">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800">Notifikasi</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold">
                {unreadCount} baru
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
              onClick={handleMarkAllRead}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <BellIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">Belum ada notifikasi</p>
              <p className="text-xs text-slate-400 mt-0.5">Pemberitahuan insiden dan status akan muncul di sini</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 p-3.5 transition-all hover:bg-slate-50 relative text-left",
                  !notif.is_read ? "bg-blue-50/40" : "bg-white"
                )}
                onClick={() => handleNotificationClick(notif)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNotificationClick(notif);
                  }
                }}
              >
                {/* Severity Icon */}
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-xs transition-transform group-hover:scale-105",
                    getSeverityBadgeClass(notif.severity)
                  )}
                >
                  {getIcon(notif.type, notif.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        "text-xs truncate font-medium",
                        !notif.is_read ? "text-slate-900 font-semibold" : "text-slate-700"
                      )}
                    >
                      {notif.title || "Pemberitahuan Sistem"}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {moment(notif.created_at).fromNow()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {(notif.action_url || notif.uuid) && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 pt-1 font-medium group-hover:underline">
                      <span>Buka detail</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Unread Indicator */}
                {!notif.is_read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-2.5 bg-slate-50/80 rounded-b-xl text-center">
          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 px-3 rounded-md hover:bg-blue-50 transition-colors w-full"
          >
            <span>Lihat Semua Riwayat Notifikasi</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
