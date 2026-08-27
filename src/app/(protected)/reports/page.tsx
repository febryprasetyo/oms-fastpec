"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/services/store";
import {
  getReports,
  createReport,
  updateReport,
  getReportDetail,
  followUpReport,
  deleteReport,
  Report,
} from "@/services/api/reports";
import { getStationList } from "@/services/api/station";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Eye, History, Wrench, Trash2, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import moment from "moment";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token;

  // Role Helper: Admin and Engineering can create and delete/manage reports
  const canManageReport = ["admin", "engineering"].includes(
    user?.user_data?.role_name?.toLowerCase() || ""
  );
  const canCreateReport = canManageReport;

  const [reports, setReports] = useState<Report[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Detail State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<Report | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    station_uuid: string;
    category: "Perbaikan" | "Penggantian Part";
    description: string;
    pic_id: number;
    pic_name: string;
    status: "Open" | "Eskalasi" | "Selesai";
    action_description: string;
  }>({
    title: "",
    station_uuid: "",
    category: "Perbaikan",
    description: "",
    pic_id: 0,
    pic_name: "",
    status: "Open",
    action_description: "",
  });

  // Follow Up Modal State
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<Report | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpForm, setFollowUpForm] = useState<{
    progress: "Pengerjaan" | "Selesai";
    activity_type: string;
    action_description: string;
  }>({
    progress: "Pengerjaan",
    activity_type: "Perbaikan",
    action_description: "",
  });

  // Delete Confirmation State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getReports(token);
      if (res.success) {
        setReports(res.data);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal memuat laporan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getStationList(token);
      if (res.success) {
        setStations(res.data.values);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReports();
      fetchStations();
    }
  }, [token, fetchReports, fetchStations]);

  const handleDetail = async (id: number) => {
    try {
      const res = await getReportDetail(token!, id);
      if (res.success) {
        setSelectedReport(res.data);
        setIsDetailOpen(true);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Gagal memuat detail", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateReport(token!, editMode.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          status: formData.status,
          action_description: formData.action_description || undefined,
          pic_id: formData.pic_id || undefined, // Only admin can send this, handled in backend validation too
          pic_name: formData.pic_name || undefined,
        });
        toast({ title: "Laporan berhasil diperbarui" });
      } else {
        await createReport(token!, {
          title: formData.title,
          station_uuid: formData.station_uuid,
          category: formData.category,
          description: formData.description,
          action_description: formData.action_description || undefined,
          status: formData.status,
        });
        toast({ title: "Laporan berhasil dibuat" });
      }
      setIsModalOpen(false);
      resetForm();
      fetchReports();
    } catch (error: any) {
      console.error(error);
      toast({
        title: error?.response?.data?.message || "Gagal menyimpan laporan",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditMode(null);
    setFormData({
      title: "",
      station_uuid: "",
      category: "Perbaikan",
      description: "",
      pic_id: 0,
      pic_name: "",
      status: "Open",
      action_description: "",
    });
  };

  const handleEdit = (report: Report) => {
    setEditMode(report);
    setFormData({
      title: report.title,
      station_uuid: report.station_uuid,
      category: report.category,
      description: report.description,
      pic_id: report.pic_id || 0,
      pic_name: report.pic_name,
      status: report.status || "Open",
      action_description: report.action_description || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenFollowUp = (report: Report) => {
    setFollowUpTarget(report);
    setFollowUpForm({
      progress: report.status === "Selesai" ? "Selesai" : "Pengerjaan",
      activity_type: "Perbaikan",
      action_description: report.action_description || "",
    });
    setIsFollowUpOpen(true);
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpTarget) return;
    if (!followUpForm.action_description.trim()) {
      toast({
        title: "Deskripsi tindakan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setFollowUpLoading(true);
    try {
      const targetStatus = followUpForm.progress === "Selesai" ? "Selesai" : "Eskalasi";
      const res = await followUpReport(token!, followUpTarget.id, {
        description: followUpForm.action_description,
        action_description: followUpForm.action_description,
        progress: followUpForm.progress,
        status: targetStatus,
        activity_type: followUpForm.activity_type,
      });

      if (res.success || res.data) {
        toast({ title: "Tindak lanjut laporan berhasil disimpan" });
        setIsFollowUpOpen(false);
        setFollowUpForm({
          progress: "Pengerjaan",
          activity_type: "Perbaikan",
          action_description: "",
        });
        fetchReports();
        if (selectedReport && selectedReport.id === followUpTarget.id) {
          handleDetail(selectedReport.id);
        }
      } else {
        toast({
          title: res.message || "Gagal menyimpan tindak lanjut",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: error?.response?.data?.message || "Gagal menyimpan tindak lanjut",
        variant: "destructive",
      });
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteReport(token!, deleteTarget.id);
      toast({ title: "Laporan berhasil dihapus" });
      setIsDeleteDialogOpen(false);
      if (selectedReport && selectedReport.id === deleteTarget.id) {
        setIsDetailOpen(false);
        setSelectedReport(null);
      }
      setDeleteTarget(null);
      fetchReports();
    } catch (error: any) {
      console.error(error);
      toast({
        title: error?.response?.data?.message || "Gagal menghapus laporan",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      Open: "bg-blue-500",
      Eskalasi: "bg-orange-500",
      Selesai: "bg-green-500",
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status}</Badge>;
  };

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.pic_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Maintenance</h1>
          <p className="text-slate-500">Manajemen laporan perbaikan dan penggantian part</p>
        </div>
        {canCreateReport && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Laporan
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari laporan..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Stasiun</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  Tidak ada laporan
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    {stations.find((s) => s.id_mesin === report.station_uuid)?.nama_stasiun ||
                      report.station_uuid}
                  </TableCell>
                  <TableCell>{report.pic_name}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {moment(report.created_at).format("DD MMM YYYY, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lihat Detail"
                        onClick={() => handleDetail(report.id)}
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Tindak Lanjut"
                        onClick={() => handleOpenFollowUp(report)}
                      >
                        <Wrench className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit Laporan"
                        onClick={() => handleEdit(report)}
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      {canManageReport && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Hapus Laporan"
                          onClick={() => {
                            setDeleteTarget(report);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Laporan" : "Buat Laporan Baru"}</DialogTitle>
            <DialogDescription className="sr-only">
              Formulir untuk {editMode ? "mengubah" : "membuat"} data laporan maintenance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid gap-2">
              <Label>Judul Laporan</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Perbaikan Pompa pH"
              />
            </div>
            {!editMode && (
              <div className="grid gap-2">
                <Label>Stasiun</Label>
                <Select
                  onValueChange={(val) => setFormData({ ...formData, station_uuid: val })}
                  value={formData.station_uuid}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Stasiun" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id_mesin} value={s.id_mesin}>
                        {s.nama_stasiun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select
                onValueChange={(val: "Perbaikan" | "Penggantian Part") =>
                  setFormData({ ...formData, category: val })
                }
                value={formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                  <SelectItem value="Penggantian Part">Penggantian Part</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pengaturan Status Laporan (Saat Edit) */}
            {editMode && (
              <div className="grid gap-2">
                <Label>Pengaturan Status Laporan</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "Open" | "Eskalasi" | "Selesai") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Eskalasi">Eskalasi</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Admin Only: Change PIC */}
            {user?.user_data?.role_name?.toLowerCase() === "admin" && editMode && (
              <div className="grid gap-2">
                <Label>PIC (Admin Override)</Label>
                <Input
                  value={formData.pic_name}
                  onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                  placeholder="Nama Teknisi"
                />
                <p className="text-[10px] text-red-500">*Hanya ubah jika perlu</p>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Uraian Laporan / Masalah</Label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Jelaskan detail masalah..."
                rows={3}
              />
            </div>

            {/* Input Deskripsi Tindakan / Catatan Perbaikan */}
            <div className="grid gap-2">
              <Label>Deskripsi Tindakan / Catatan Perbaikan</Label>
              <Textarea
                value={formData.action_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, action_description: e.target.value })
                }
                placeholder="Catatan tindakan perbaikan atau penanganan teknisi..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription className="sr-only">
              Menampilkan rincian informasi laporan maintenance dan riwayat pengerjaan.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Info Header */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Judul</p>
                  <p className="font-semibold">{selectedReport.title}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Stasiun</p>
                  <p className="font-semibold">
                    {stations.find((s) => s.id_mesin === selectedReport.station_uuid)
                      ?.nama_stasiun || selectedReport.station_uuid}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">PIC</p>
                  <p className="font-semibold">{selectedReport.pic_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs">Deskripsi Awal Masalah</p>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs">Deskripsi Tindakan Terkini</p>
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap font-medium">
                    {selectedReport.action_description || "Belum ada tindakan perbaikan"}
                  </p>
                </div>
              </div>

              {/* Action Button & Riwayat Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Riwayat Pengerjaan
                </h4>
                <Button
                  size="sm"
                  onClick={() => handleOpenFollowUp(selectedReport)}
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                >
                  <Wrench className="h-4 w-4" />
                  Tindak Lanjut
                </Button>
              </div>

              {/* Timeline History */}
              <div className="border rounded-md divide-y">
                {!selectedReport.history || selectedReport.history.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    Belum ada riwayat pengerjaan via Logbook.
                  </div>
                ) : (
                  selectedReport.history.map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{log.activity_type}</span>
                        <span className="text-xs text-slate-400">
                          {moment(log.created_at).format("DD MMM YYYY, HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{log.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {log.progress || "N/A"}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          by {log.created_by}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Follow-Up Modal */}
      <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              Tindak Lanjut Laporan
            </DialogTitle>
            <DialogDescription>
              Catat aktivitas perbaikan dan perbarui status pengerjaan untuk laporan:{" "}
              <span className="font-semibold text-slate-800">
                {followUpTarget?.title}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Input Progress */}
            <div className="grid gap-2">
              <Label>Progress / Status Target</Label>
              <Select
                value={followUpForm.progress}
                onValueChange={(val: "Pengerjaan" | "Selesai") =>
                  setFollowUpForm({ ...followUpForm, progress: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Progress" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="Pengerjaan">
                    Pengerjaan (Status: Eskalasi)
                  </SelectItem>
                  <SelectItem value="Selesai">
                    Selesai (Status: Selesai & Normalisasi Stasiun)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500">
                {followUpForm.progress === "Selesai"
                  ? "Laporan akan ditandai selesai dan status operasional stasiun akan dinormalisasi."
                  : "Laporan akan masuk ke status Eskalasi / dalam pengerjaan teknisi."}
              </p>
            </div>

            {/* Input Tipe Aktivitas */}
            <div className="grid gap-2">
              <Label>Tipe Aktivitas</Label>
              <Select
                value={followUpForm.activity_type}
                onValueChange={(val) =>
                  setFollowUpForm({ ...followUpForm, activity_type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe Aktivitas" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                  <SelectItem value="Penggantian Part">Penggantian Part</SelectItem>
                  <SelectItem value="Pemeriksaan">Pemeriksaan</SelectItem>
                  <SelectItem value="Pembersihan">Pembersihan</SelectItem>
                  <SelectItem value="Kalibrasi">Kalibrasi</SelectItem>
                  <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input Deskripsi Tindakan */}
            <div className="grid gap-2">
              <Label>Deskripsi Tindakan / Catatan Penanganan</Label>
              <Textarea
                value={followUpForm.action_description}
                onChange={(e) =>
                  setFollowUpForm({
                    ...followUpForm,
                    action_description: e.target.value,
                  })
                }
                placeholder="Jelaskan penanganan teknisi, komponen yang diganti/diperbaiki, atau hasil pengujian..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFollowUpOpen(false)}
              disabled={followUpLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleFollowUpSubmit}
              disabled={followUpLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {followUpLoading ? "Menyimpan..." : "Simpan Tindak Lanjut"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Laporan Maintenance</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus laporan{" "}
              <span className="font-semibold text-slate-800">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? Tindakan ini akan menghapus data laporan secara permanen dan tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteLoading}
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
            >
              {deleteLoading ? "Menghapus..." : "Hapus Laporan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
