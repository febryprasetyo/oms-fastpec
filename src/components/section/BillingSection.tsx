"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBillingSummary, getBillingHistory, updateBillingStatus } from "@/services/api/billing";
import { formatRupiah } from "@/lib/utils";
import { Receipt, Clock, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { DataTable } from "../features/dataTable/DataTable";
import { Button } from "../ui/button";
import { toast } from "sonner";
import moment from "moment";

type Props = {
  cookie: string;
};

export default function BillingSection({ cookie }: Props) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["billing-summary", stationFilter],
    queryFn: () => getBillingSummary(cookie, stationFilter || undefined),
  });

  const historyQuery = useQuery({
    queryKey: ["billing-history", stationFilter],
    queryFn: () => getBillingHistory(cookie, { station: stationFilter || undefined, limit: 100 }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: any) => updateBillingStatus(cookie, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
      queryClient.invalidateQueries({ queryKey: ["billing-history"] });
      toast.success("Status berhasil diperbarui");
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  const columns = [
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: ({ row }: any) => moment(row.original.tanggal).format("DD/MM/YYYY"),
    },
    {
      header: "Tipe",
      accessorKey: "type",
      cell: ({ row }: any) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.original.type === 'paket' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
          {row.original.type === 'paket' ? 'Pulsa' : 'Listrik'}
        </span>
      ),
    },
    {
      header: "Stasiun",
      accessorKey: "station",
    },
    {
      header: "Deskripsi",
      accessorKey: "nama",
      cell: ({ row }: any) => row.original.nama || row.original.nama_paket,
    },
    {
      header: "Harga",
      accessorKey: "harga",
      cell: ({ row }: any) => formatRupiah(Number(row.original.harga)),
    },
    {
      header: "Status Tagihan",
      accessorKey: "billing_status",
      cell: ({ row }: any) => (
        <select
          value={row.original.billing_status}
          onChange={(e) => updateStatusMutation.mutate({ type: row.original.type, id: row.original.id, billing_status: e.target.value })}
          className={`rounded-md border-none bg-transparent text-xs font-semibold focus:ring-0 ${row.original.billing_status === 'billed' ? 'text-emerald-600' : 'text-amber-600'}`}
        >
          <option value="unbilled">Unbilled</option>
          <option value="billed">Billed</option>
        </select>
      ),
    },
    {
      header: "Status Reimburse",
      accessorKey: "reimbursement_status",
      cell: ({ row }: any) => (
        <select
          value={row.original.reimbursement_status}
          onChange={(e) => updateStatusMutation.mutate({ type: row.original.type, id: row.original.id, reimbursement_status: e.target.value })}
          className={`rounded-md border-none bg-transparent text-xs font-semibold focus:ring-0 ${row.original.reimbursement_status === 'reimbursed' ? 'text-emerald-600' : 'text-amber-600'}`}
        >
          <option value="pending">Pending</option>
          <option value="reimbursed">Reimbursed</option>
        </select>
      ),
    },
  ];

  const summary = summaryQuery.data?.data || summaryQuery.data || {};
  const historyData = Array.isArray(historyQuery.data) ? historyQuery.data : (historyQuery.data?.data || []);

  console.log("Billing History Data:", historyData);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Tagihan</h1>
        <p className="text-slate-500">Pantau dan kelola pengajuan operasional dan status reimbursement.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Tagihan"
          value={formatRupiah(summary.total_bill || 0)}
          icon={<Receipt className="h-6 w-6" />}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Belum Ditagih"
          value={formatRupiah(summary.total_unbilled || 0)}
          icon={<AlertCircle className="h-6 w-6" />}
          color="bg-amber-500"
        />
        <SummaryCard
          title="Sudah Reimburse"
          value={formatRupiah(summary.total_reimbursed || 0)}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="bg-emerald-500"
        />
        <SummaryCard
          title="Pending Reimburse"
          value={formatRupiah(summary.total_pending_reimbursement || 0)}
          icon={<Clock className="h-6 w-6" />}
          color="bg-slate-500"
        />
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold">Riwayat Pengajuan (3 Bulan Terakhir)</h2>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari stasiun..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={historyData}
          isLoading={historyQuery.isLoading}
        />
      </div>
    </section>
  );
}

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`${color} flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg shadow-blue-200/20`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
