"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/services/store";
import { getNotifications, markAsRead, markAllAsRead, Notification } from "@/services/api/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  FileCheck2,
  Wrench,
  Search,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Clock,
  Radio
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import moment from "moment";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "Semua" },
  { key: "unread", label: "Belum Dibaca" },
  { key: "connectivity", label: "Konektivitas Stasiun" },
  { key: "quality", label: "Kualitas Sensor" },
  { key: "calibration", label: "Kalibrasi" },
  { key: "maintenance", label: "Perawatan & Logbook" },
];

export default function NotificationsPage() {
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 25;

  const fetchNotifs = useCallback(
    async (reset = false) => {
      if (!token) return;
      setLoading(true);
      try {
        const offset = reset ? 0 : page * LIMIT;
        const category = activeTab === "all" || activeTab === "unread" ? undefined : activeTab;
        const unreadOnly = activeTab === "unread";

        const res = await getNotifications(token, LIMIT, offset, category, unreadOnly);
        if (res?.success || res?.data) {
          const list = res.data.notifications || [];
          if (reset) {
            setNotifications(list);
            setPage(1);
          } else {
            setNotifications((prev) => [...prev, ...list]);
            setPage((p) => p + 1);
          }
          setUnreadCount(res.data.unread_count || 0);
          setHasMore(list.length === LIMIT);
        }
      } catch (error) {
        console.error("[NOTIFICATIONS-PAGE] Failed to fetch notifications", error);
        toast({
          title: "Gagal memuat notifikasi",
          description: "Terjadi kesalahan saat mengambil data notifikasi.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [token, activeTab, page]
  );

  useEffect(() => {
    fetchNotifs(true);
  }, [activeTab, token]);

  const handleMarkAsRead = async (notif: Notification) => {
    if (!token) return;
    if (!notif.is_read) {
      try {
        await markAsRead(token, notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (error) {
        console.error("[NOTIFICATIONS-PAGE] Failed to mark as read", error);
      }
    }

    if (notif.action_url) {
      router.push(notif.action_url);
    } else if (notif.uuid) {
      router.push(`/monitoring/${notif.uuid}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: "Berhasil",
        description: "Semua notifikasi telah ditandai sebagai dibaca.",
      });
    } catch (error) {
      console.error("[NOTIFICATIONS-PAGE] Failed to mark all read", error);
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Kritis</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Peringatan</Badge>;
      case "success":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Selesai</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Info</Badge>;
    }
  };

  const getIcon = (type: string, severity?: string) => {
    if (severity === "critical" || type === "offline" || type === "station_offline") {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (severity === "warning" || type === "threshold_exceeded" || type === "calibration_rejected") {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    if (severity === "success" || type === "online" || type === "station_online" || type === "calibration_approved") {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    }
    if (type === "maintenance") {
      return <Wrench className="h-5 w-5 text-amber-500" />;
    }
    if (type === "logbook") {
      return <History className="h-5 w-5 text-indigo-500" />;
    }
    if (type?.startsWith("calibration")) {
      return <FileCheck2 className="h-5 w-5 text-blue-500" />;
    }
    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (notif.title && notif.title.toLowerCase().includes(q)) ||
      (notif.message && notif.message.toLowerCase().includes(q)) ||
      (notif.uuid && notif.uuid.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pusat Notifikasi</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white hover:bg-red-600 font-semibold px-2.5 py-0.5">
                {unreadCount} Belum Dibaca
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat lengkap peringatan sistem, status konektivitas stasiun, dan kalibrasi sensor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifs(true)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span>Segarkan</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tandai Semua Dibaca</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              )}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 text-red-700 px-1.5 py-0.2 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari notifikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-white"
          />
        </div>
      </div>

      {/* Notification List Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
        {loading && notifications.length === 0 ? (
          <div className="p-16 text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Memuat riwayat notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Tidak ada notifikasi</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search ? "Tidak ditemukan notifikasi yang cocok dengan kata kunci pencarian." : "Seluruh notifikasi pada kategori ini telah ditinjau."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              role="button"
              tabIndex={0}
              onClick={() => handleMarkAsRead(notif)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleMarkAsRead(notif);
                }
              }}
              className={cn(
                "group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 transition-all hover:bg-slate-50/80 cursor-pointer text-left",
                !notif.is_read ? "bg-blue-50/35 border-l-4 border-l-blue-600" : "bg-white"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                  {getIcon(notif.type, notif.severity)}
                </div>

                {/* Body Content */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={cn("text-sm font-semibold", !notif.is_read ? "text-slate-900" : "text-slate-700")}>
                      {notif.title || "Pemberitahuan Sistem"}
                    </h4>
                    {getSeverityBadge(notif.severity)}
                    {notif.uuid && (
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        UUID: {notif.uuid}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {moment(notif.created_at).format("DD MMM YYYY, HH:mm [WIB]")} ({moment(notif.created_at).fromNow()})
                    </span>
                    <span>•</span>
                    <span>Sumber: {notif.created_by || "SYSTEM"}</span>
                  </div>
                </div>
              </div>

              {/* Action Button Indicator */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {(notif.action_url || notif.uuid) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                    <span>Lihat Detail</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
                {!notif.is_read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Load More */}
      {hasMore && filteredNotifications.length > 0 && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => fetchNotifs(false)}
            className="text-xs font-semibold px-6"
          >
            {loading ? "Memuat..." : "Muat Notifikasi Lainnya"}
          </Button>
        </div>
      )}
    </div>
  );
}
