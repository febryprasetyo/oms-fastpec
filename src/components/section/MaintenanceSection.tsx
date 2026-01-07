"use client";
import { useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKlhkStatusSummary } from "@/services/api/station";
import { 
  saveMaintenanceLog, 
  getMaintenanceHistory, 
  updateCalibrationSchedule,
  updateMaintenanceStatus,
  MaintenanceStatus,
  MaintenanceHistoryItem,
  MaintenanceLogRequest
} from "@/services/api/maintenance";
import { useAuthStore } from "@/services/store";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Plus, 
  History, 
  MapPin, 
  Clock,
  Play,
  Square,
  Wrench,
  Settings2,
  LayoutList,
  MessageSquare,
  Search
} from "lucide-react";
import moment from "moment";
import "moment/locale/id";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

type Props = {
  cookie: string;
};

export default function MaintenanceSection({ cookie }: Props) {
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [calDate, setCalDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state?.user?.token?.access_token);
  const userName = useAuthStore((state) => state?.user?.user_data?.username || "Petugas");

  // Fetch station status list
  const stationStatusQuery = useQuery({
    queryKey: ["station-status-maintenance"],
    queryFn: () => getKlhkStatusSummary(cookie),
    refetchInterval: 30000,
  });

  // Fetch history for selected station
  const historyQuery = useQuery({
    queryKey: ["maintenance-history", selectedUuid],
    queryFn: () => getMaintenanceHistory(selectedUuid!, cookie),
    enabled: !!selectedUuid && !!cookie && isModalOpen,
  });

  const logMutation = useMutation({
    mutationFn: (data: MaintenanceLogRequest) => saveMaintenanceLog(data, cookie),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Log aktivitas berhasil disimpan",
      });
      setActivityType("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["maintenance-history", selectedUuid] });
      queryClient.invalidateQueries({ queryKey: ["station-status-maintenance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan log",
        variant: "destructive",
      });
    },
  });

  const calMutation = useMutation({
    mutationFn: (data: { uuid: string; next_calibration_date: string }) => 
      updateCalibrationSchedule(data, cookie),
    onSuccess: () => {
      console.log("Calibration update success");
      toast({
        title: "Berhasil",
        description: "Jadwal kalibrasi berhasil diperbarui",
      });
      setIsCalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["station-status-maintenance"] });
    },
    onError: (error: any) => {
      console.error("Calibration update error:", error);
      toast({
        title: "Gagal",
        description: error.message || "Gagal memperbarui jadwal kalibrasi",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { uuid: string; status: MaintenanceStatus }) => 
      updateMaintenanceStatus(data, cookie),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Status alat berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["station-status-maintenance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message || "Gagal memperbarui status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (uuid: string, status: MaintenanceStatus) => {
    const activityMap: Record<string, string> = {
      start: "Start",
      stop: "Stop",
      maintenance: "Maintenance",
      calibration: "Calibration"
    };

    const type = activityMap[status] || status;
    const desc = `Merubah status alat menjadi ${type.toUpperCase()}`;

    // Update form states so user sees it in the modal
    setActivityType(type);
    setDescription(desc);

    // Call logMutation directly to ensure a complete history record (avoiding null activity_type)
    logMutation.mutate({
      uuid: uuid,
      status: status,
      activity_type: type,
      description: desc,
      next_calibration_date: "",
    });
  };
  
  const openCalModal = (uuid: string) => {
    console.log("🛠️ openCalModal called with UUID:", uuid);
    const station = stations.find(s => s.uuid === uuid);
    setSelectedUuid(uuid);
    setIsCalModalOpen(true);
    
    // Set initial date from station data if available, or today
    if (station?.next_calibration_date && moment(station.next_calibration_date, "YYYY-MM-DD", true).isValid()) {
      setCalDate(new Date(station.next_calibration_date));
    } else {
      setCalDate(new Date());
    }
  };

  const handleUpdateCal = () => {
    console.log("🚀 handleUpdateCal execution started", { selectedUuid, calDate });
    
    if (!selectedUuid) {
      console.error("❌ Aborted: selectedUuid is missing!");
      toast({ title: "Error", description: "Internal Error: UUID Hilang. Coba buka kembali modal.", variant: "destructive" });
      return;
    }

    if (!calDate) {
      console.error("❌ Aborted: calDate is missing!");
      toast({ title: "Error", description: "Mohon pilih tanggal terlebih dahulu.", variant: "destructive" });
      return;
    }

    const formattedDate = moment(calDate).format("YYYY-MM-DD");
    console.log("📝 Sending mutation for calibration:", { uuid: selectedUuid, next_calibration_date: formattedDate });
    
    calMutation.mutate({ uuid: selectedUuid, next_calibration_date: formattedDate });
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUuid || !activityType || !description) {
      toast({
        title: "Peringatan",
        description: "Mohon isi semua field",
        variant: "destructive",
      });
      return;
    }
    logMutation.mutate({
      uuid: selectedUuid,
      status: currentStation?.instrument_status || "maintenance",
      activity_type: activityType,
      description: description,
      next_calibration_date: "",
    });
  };

  const handleOpenDetail = (uuid: string) => {
    setSelectedUuid(uuid);
    setIsModalOpen(true);
  };

  // Deduplicate data by uuid or id_mesin to prevent duplicate key errors
  const stations = stationStatusQuery.data?.data?.reduce((acc: any[], current: any) => {
    const currentId = current.uuid || current.id_mesin;
    const x = acc.find(item => (item.uuid || item.id_mesin) === currentId);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []) || [];

  const currentStation = stations.find(s => (s.uuid || s.id_mesin) === selectedUuid);

  // Filter stations based on search term
  const filteredStations = stations.filter((station: any) => 
    station.id_mesin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.nama_stasiun?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Station Table: Full Width */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daftar Maintenance Stasiun</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Stasiun..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-darkSecondary dark:border-dark_accent overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-dark_accent/20">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-200">ID STASIUN</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-200">STASIUN</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-200">STATUS</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-200">JADWAL KALIBRASI</TableHead>
                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stationStatusQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span>Memuat data stasiun...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                    Tidak ada stasiun yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStations.map((station: any) => {
                  const stationId = station.uuid || station.id_mesin;
                  return (
                    <TableRow 
                      key={stationId} 
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-dark_accent/10"
                    >
                    <TableCell className="font-bold text-slate-700 dark:text-slate-300">
                      {station.id_mesin}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3" />
                        <span>{station.nama_stasiun || "Unknown Station"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BadgeStatus status={station.instrument_status || "NORMAL"} />
                    </TableCell>
                    <TableCell>
                      <CalibrationDisplay 
                        date={station.next_calibration_date} 
                        overdue={station.overdue_days} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-amber-600 hover:text-amber-700 border-amber-100 hover:bg-amber-50 h-7 text-[11px]"
                          onClick={() => openCalModal(stationId)}
                        >
                          Set Cal
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 h-7 text-[11px]"
                          onClick={() => handleOpenDetail(stationId)}
                        >
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                      </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Logbook Drawer: Sheet */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent side="right" className="sm:max-w-[540px] gap-0 p-0 overflow-hidden border-l dark:border-dark_accent">
          <SheetHeader className="p-6 bg-slate-50 dark:bg-dark_accent/20 border-b border-slate-100 dark:border-dark_accent text-left">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Logbook {currentStation?.nama_stasiun || "Stasiun"}
            </SheetTitle>
            <SheetDescription className="text-sm font-medium">
              ID Mesin: {currentStation?.id_mesin || selectedUuid}
            </SheetDescription>
          </SheetHeader>

          <div className="h-[calc(100vh-140px)] p-6 space-y-8 overflow-y-auto">
            {/* Action Form */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4 dark:bg-blue-900/10 dark:border-blue-800/20">
              <h4 className="mb-3 text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Catat Aktivitas Baru
              </h4>
              <form onSubmit={handleSaveLog} className="space-y-6">
                {/* 1. Device Status Control - Prioritized Top */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Settings2 className="h-3.5 w-3.5" />
                    STATUS PERANGKAT & KONTROL
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white/50 dark:bg-dark/20 rounded-xl border border-slate-200/50 dark:border-dark_accent/30 shadow-inner">
                    <StatusButton
                      active={currentStation?.instrument_status?.toLowerCase() === "normal" || currentStation?.instrument_status?.toLowerCase() === "start"}
                      icon={<Play className="h-3 w-3" />}
                      label="Start"
                      color="emerald"
                      onClick={() => handleAction(currentStation!.uuid || currentStation!.id_mesin, "start")}
                    />
                    <StatusButton
                      active={currentStation?.instrument_status?.toLowerCase() === "stop"}
                      icon={<Square className="h-3 w-3" />}
                      label="Stop"
                      color="red"
                      onClick={() => handleAction(currentStation!.uuid || currentStation!.id_mesin, "stop")}
                    />
                    <StatusButton
                      active={currentStation?.instrument_status?.toLowerCase() === "maintenance" || currentStation?.instrument_status?.toLowerCase() === "sedang diperbaiki"}
                      icon={<Wrench className="h-3 w-3" />}
                      label="Maint"
                      color="amber"
                      onClick={() => handleAction(currentStation!.uuid || currentStation!.id_mesin, "maintenance")}
                    />
                    <StatusButton
                      active={currentStation?.instrument_status?.toLowerCase() === "calibration" || currentStation?.instrument_status?.toLowerCase() === "kalibrasi"}
                      icon={<Settings2 className="h-3 w-3" />}
                      label="Cal"
                      color="blue"
                      onClick={() => handleAction(currentStation!.uuid || currentStation!.id_mesin, "calibration")}
                    />
                  </div>
                </div>

                {/* 2. Activity Classification */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <LayoutList className="h-3.5 w-3.5" />
                    TIPE AKTIVITAS
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:bg-dark dark:border-dark_accent"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                  >
                    <option value="">Pilih Aktivitas...</option>
                    <option value="Pengecekan Rutin">Pengecekan Rutin</option>
                    <option value="Kalibrasi Sensor">Kalibrasi Sensor</option>
                    <option value="Perbaikan Alat">Perbaikan Alat</option>
                    <option value="Ganti Part">Ganti Part</option>
                  </select>
                </div>

                {/* 3. Detailed Description */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    DESKRIPSI TINDAKAN
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none dark:bg-dark dark:border-dark_accent"
                    placeholder="Contoh: Perbaikan PSU, Pembersihan Sensor..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary h-11 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-xl"
                  disabled={logMutation.isPending}
                >
                  {logMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Simpan Catatan Aktivitas
                </Button>
              </form>
            </div>

            {/* History Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <History className="h-3.5 w-3.5" />
                RIWAYAT TERAKHIR
              </h4>
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-dark_accent">
                {historyQuery.isLoading ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Memuat riwayat...</span>
                  </div>
                ) : historyQuery.data?.data?.length > 0 ? (
                  historyQuery.data.data.slice(0, 5).map((item: MaintenanceHistoryItem) => (
                    <div key={item.id} className="relative">
                      <div className={`absolute -left-[24px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-200 dark:border-dark dark:bg-slate-700 ${item.activity_type?.includes('Kalibrasi') ? 'bg-blue-500' : ''}`} />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.activity_type || "Aktivitas Tanpa Nama"}</h5>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{moment(item.created_at).calendar()}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500">Teknisi: {item.created_by || "Petugas"}</p>
                        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-dark_accent/20 dark:text-slate-400 border border-slate-100 dark:border-dark_accent/30">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-slate-50/50 dark:bg-dark_accent/10 rounded-lg border border-dashed border-slate-200 dark:border-dark_accent text-sm text-slate-400">
                    Belum ada riwayat aktivitas untuk stasiun ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Calibration Modal */}
      <Dialog open={isCalModalOpen} onOpenChange={setIsCalModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="px-6 pt-6 uppercase">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-amber-500" />
              Set Jadwal Kalibrasi
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              ID: {currentStation?.id_mesin} - {currentStation?.nama_stasiun}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 flex flex-col items-center justify-center">
            <div className="rounded-md border border-slate-100 dark:border-dark_accent bg-slate-50/30 dark:bg-dark_accent/5">
              <Calendar
                mode="single"
                selected={calDate}
                onSelect={setCalDate}
                initialFocus
                className="rounded-md"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCalModalOpen(false)}>Batal</Button>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90" 
              onClick={handleUpdateCal} 
              disabled={calMutation.isPending || !calDate || !selectedUuid}
            >
              {calMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const s = status.toLowerCase();
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    normal: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", label: "NORMAL" },
    start: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400", label: "NORMAL" },
    stop: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", label: "STOP" },
    maintenance: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", label: "SEDANG DIPERBAIKI" },
    "sedang diperbaiki": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", label: "SEDANG DIPERBAIKI" },
    calibration: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", label: "KALIBRASI" },
    kalibrasi: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", label: "KALIBRASI" },
    rusak: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400", label: "RUSAK" },
  };

  const config = configs[s] || configs.normal;

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function StatusButton({ 
  active, 
  icon, 
  label, 
  color, 
  onClick 
}: { 
  active: boolean; 
  icon: React.ReactNode; 
  label: string; 
  color: "emerald" | "red" | "amber" | "blue";
  onClick: () => void;
}) {
  const colorConfigs = {
    emerald: active ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    red: active ? "bg-red-600 text-white shadow-red-200" : "bg-red-50 text-red-600 hover:bg-red-100",
    amber: active ? "bg-amber-600 text-white shadow-amber-200" : "bg-amber-50 text-amber-600 hover:bg-amber-100",
    blue: active ? "bg-blue-600 text-white shadow-blue-200" : "bg-blue-50 text-blue-600 hover:bg-blue-100",
  };

  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold transition-all ${colorConfigs[color]} ${active ? "shadow-sm scale-105" : "scale-100 opacity-70 hover:opacity-100"}`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="h-1 w-1 rounded-full bg-white animate-pulse" />}
    </button>
  );
}

function CalibrationDisplay({ date, overdue }: { date?: string; overdue?: number }) {
  if (!date && (!overdue || overdue === 0)) return <span className="text-slate-400">-</span>;

  if (overdue && overdue > 0) {
    return (
      <div className="flex flex-col">
        <span className="text-xs font-bold text-red-600 dark:text-red-400">Terlewat {overdue} Hari</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {moment(date).format("D MMM YYYY")}
      </span>
    </div>
  );
}
