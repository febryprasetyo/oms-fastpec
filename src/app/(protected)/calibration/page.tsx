"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronLeft, ChevronRight, Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApproveCalibration, useCalibrationAuth, useCalibrations, useDeleteCalibration } from "@/hook/useCalibration";
import { StatusBadge } from "@/components/features/badge/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const pageSize = 20;

export default function CalibrationDashboard() {
  const { role } = useCalibrationAuth();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "submitted" | "approved">("all");
  const { data, isLoading } = useCalibrations({ limit: pageSize, offset: page * pageSize, ...(status === "all" ? {} : { status }) });
  const deleteMutation = useDeleteCalibration();
  const approveMutation = useApproveCalibration();
  const canApprove = role === "adm";
  const rows = useMemo(() => (data?.items ?? []).filter((item) => `${item.reportNo} ${item.stationName} ${item.officer}`.toLowerCase().includes(query.toLowerCase())), [data?.items, query]);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  const remove = async (id: string) => {
    if (!window.confirm("Hapus calibration draft ini?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Calibration berhasil dihapus"); } catch { toast.error("Calibration tidak dapat dihapus"); }
  };
  const approve = async (id: string) => {
    if (!window.confirm("Approve calibration ini?")) return;
    try { await approveMutation.mutateAsync(id); toast.success("Calibration berhasil disetujui"); } catch { toast.error("Calibration tidak dapat disetujui"); }
  };

  return <div className="space-y-6 p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight">Calibration</h1><p className="text-sm text-muted-foreground">Kelola laporan kalibrasi stasiun.</p></div><Button asChild><Link href="/calibration/create"><Plus className="mr-2 h-4 w-4" />New Calibration</Link></Button></div>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari report, station, atau officer..." /></div><Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPage(0); }}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="submitted">Submitted</SelectItem><SelectItem value="approved">Approved</SelectItem></SelectContent></Select></div>
    <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Report No</TableHead><TableHead>Station</TableHead><TableHead>Date</TableHead><TableHead>Officer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={6} className="py-10 text-center">Memuat calibration...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Belum ada data calibration.</TableCell></TableRow> : rows.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.reportNo}</TableCell><TableCell>{item.stationName}</TableCell><TableCell>{item.calibrationDate}</TableCell><TableCell>{item.officer}</TableCell><TableCell><StatusBadge status={item.status} /></TableCell><TableCell><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="icon"><Link href={`/calibration/${item.id}`}><Eye className="h-4 w-4" /></Link></Button>{item.status === "Draft" && <Button asChild variant="ghost" size="icon"><Link href={`/calibration/edit/${item.id}`}><FileText className="h-4 w-4" /></Link></Button>}{item.status === "Draft" && <Button variant="ghost" size="icon" onClick={() => void remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}{canApprove && item.status === "Submitted" && <Button variant="ghost" size="icon" onClick={() => void approve(item.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>}</div></TableCell></TableRow>)}</TableBody></Table></div>
    <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Halaman {page + 1} dari {totalPages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight className="h-4 w-4" /></Button></div></div>
  </div>;
}
