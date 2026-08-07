"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/services/store";
import { getReports, createReport, updateReport, getReportDetail, Report } from "@/services/api/reports";
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Eye, History } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import moment from "moment";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const user = useAuthStore((state) => state?.user);
  const token = user?.token?.access_token;

  // Role Helper: Only Admin and Engineering can create reports
  const canCreateReport = ["admin", "engineering"].includes(user?.user_data?.role_name?.toLowerCase() || "");

  const [reports, setReports] = useState<Report[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Detail State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    station_uuid: "",
    category: "Perbaikan",
    description: "",
    pic_id: 0,
    pic_name: ""
  });

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

  useEffect(() => {
    if (token) {
      fetchReports();
      fetchStations();
    }
  }, [token]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports(token!);
      if (res.success) {
        setReports(res.data);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal memuat laporan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await getStationList(token!);
      if (res.success) {
        setStations(res.data.values);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateReport(token!, editMode.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          pic_id: formData.pic_id || undefined, // Only admin can send this, handled in backend validation too
          pic_name: formData.pic_name || undefined
        });
        toast({ title: "Laporan berhasil diperbarui" });
      } else {
        await createReport(token!, {
          title: formData.title,
          station_uuid: formData.station_uuid,
          category: formData.category,
          description: formData.description
        });
        toast({ title: "Laporan berhasil dibuat" });
      }
      setIsModalOpen(false);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error(error);
      toast({ title: "Gagal menyimpan laporan", variant: "destructive" });
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
      pic_name: ""
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
      pic_name: report.pic_name
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      'Open': 'bg-blue-500',
      'Eskalasi': 'bg-orange-500',
      'Selesai': 'bg-green-500'
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  const filteredReports = reports.filter(r =>
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
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Laporan
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4">
        {/* Search Input (Existing) */}
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
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Tidak ada laporan</TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    {stations.find(s => s.id_mesin === report.station_uuid)?.nama_stasiun || report.station_uuid}
                  </TableCell>
                  <TableCell>{report.pic_name}</TableCell>
                  <TableCell>{report.category}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{moment(report.created_at).format('DD MMM YYYY, HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDetail(report.id)}>
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(report)}>Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* ... Existing Modal Content ... */}
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Laporan" : "Buat Laporan Baru"}</DialogTitle>
            <DialogDescription className="sr-only">
              Formulir untuk {editMode ? "mengubah" : "membuat"} data laporan maintenance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* ... Form Fields ... */}
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
                onValueChange={(val) => setFormData({ ...formData, category: val })}
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

            {/* Admin Only: Change PIC */}
            {user?.user_data?.role_name?.toLowerCase() === 'admin' && editMode && (
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
              <Label>Uraian Laporan</Label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan detail masalah..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
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
                  <p className="font-semibold">{selectedReport.station_uuid}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">PIC</p>
                  <p className="font-semibold">{selectedReport.pic_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs">Deskripsi Awal</p>
                  <p className="mt-1 text-slate-700">{selectedReport.description}</p>
                </div>
              </div>

              {/* Timeline History */}
              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Riwayat Pengerjaan
                </h4>
                <div className="border rounded-md divide-y">
                  {(!selectedReport.history || selectedReport.history.length === 0) ? (
                    <div className="p-4 text-center text-slate-500 text-sm">Belum ada riwayat pengerjaan via Logbook.</div>
                  ) : (
                    selectedReport.history.map((log: any) => (
                      <div key={log.id} className="p-3 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{log.activity_type}</span>
                          <span className="text-xs text-slate-400">{moment(log.created_at).format('DD MMM YYYY, HH:mm')}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{log.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{log.progress || 'N/A'}</Badge>
                          <span className="text-[10px] text-slate-400">by {log.created_by}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
