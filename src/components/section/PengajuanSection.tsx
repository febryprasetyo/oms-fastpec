"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  getPengajuanInternetList,
  getPengajuanListrikList,
} from "@/services/api/pengajuan";
import ActionModal from "../features/actionButton/ActionModal";
import { Input } from "@/components/ui/input";
import ReactPaginate from "react-paginate";
import moment from "moment";
import { Search, FileText, Plus, Globe, Zap, ListFilter } from "lucide-react";

type Props = {
  cookie: string;
};

export default function PengajuanSection({ cookie }: Props) {
  // --- Internet State ---
  const [internetPage, setInternetPage] = useState(0);
  const [internetSearch, setInternetSearch] = useState("");
  const [debouncedInternetSearch, setDebouncedInternetSearch] = useState("");
  const itemsPerPage = 10;

  // --- Listrik State ---
  const [listrikPage, setListrikPage] = useState(0);
  const [listrikSearch, setListrikSearch] = useState("");
  const [debouncedListrikSearch, setDebouncedListrikSearch] = useState("");

  // --- New: active tab ---
  const [activeTab, setActiveTab] = useState<"internet" | "listrik">(
    "internet",
  );

  // Debounce Internet Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInternetSearch(internetSearch);
      setInternetPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [internetSearch]);

  // Debounce Listrik Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedListrikSearch(listrikSearch);
      setListrikPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [listrikSearch]);

  // --- Queries ---
  const internetQuery = useQuery({
    queryKey: ["pengajuan-internet"],
    queryFn: () => getPengajuanInternetList(cookie, ""),
    staleTime: 0,
  });

  const listrikQuery = useQuery({
    queryKey: ["pengajuan-listrik"],
    queryFn: () => getPengajuanListrikList(cookie, ""),
    staleTime: 0,
  });

  // Helper: format to "Rp. 100.000"
  const formatRupiah = (val: any) => {
    const num = Number(val) || 0;
    const formatter = new Intl.NumberFormat("id-ID");
    return `Rp. ${formatter.format(num)}`;
  };

  // --- Columns ---
  const internetColumns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => moment(row.getValue("tanggal")).format("DD/MM/YYYY"),
    },
    { accessorKey: "station", header: "Stasiun" },
    { accessorKey: "nama_paket", header: "Nama Paket" },
    { accessorKey: "masa_aktif", header: "Masa Aktif (Hari)" },
    {
      accessorKey: "harga",
      header: "Harga",
      cell: ({ row }) => formatRupiah(row.getValue("harga")),
    },
    { accessorKey: "pic", header: "PIC" },
  ];

  const listrikColumns: ColumnDef<any>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => moment(row.getValue("tanggal")).format("DD/MM/YYYY"),
    },
    { accessorKey: "station", header: "Stasiun" },
    { accessorKey: "nama", header: "Nama Pengajuan" },
    { accessorKey: "kwh", header: "KWH" },
    {
      accessorKey: "harga",
      header: "Harga",
      cell: ({ row }) => formatRupiah(row.getValue("harga")),
    },
    { accessorKey: "pic", header: "PIC" },
  ];

  // --- Pagination & Client-side Filtering ---
  // Internet
  const rawInternetData = internetQuery?.data?.data;
  const internetData = Array.isArray(rawInternetData)
    ? rawInternetData
    : Array.isArray((rawInternetData as any)?.values)
      ? (rawInternetData as any)?.values
      : [];

  const qInternet = debouncedInternetSearch.trim().toLowerCase();
  const filteredInternetData = qInternet
    ? internetData.filter((it: any) => {
        return (
          String(it.station || "")
            .toLowerCase()
            .includes(qInternet) ||
          String(it.nama_paket || "")
            .toLowerCase()
            .includes(qInternet) ||
          String(it.pic || "")
            .toLowerCase()
            .includes(qInternet) ||
          String(it.id ?? "")
            .toLowerCase()
            .includes(qInternet)
        );
      })
    : internetData;

  const internetPageCount = Math.ceil(
    filteredInternetData.length / itemsPerPage,
  );
  const currentInternetItems = filteredInternetData.slice(
    internetPage * itemsPerPage,
    (internetPage + 1) * itemsPerPage,
  );

  // Listrik
  const rawListrikData = listrikQuery?.data?.data;
  const listrikData = Array.isArray(rawListrikData)
    ? rawListrikData
    : Array.isArray((rawListrikData as any)?.values)
      ? (rawListrikData as any)?.values
      : [];

  const qListrik = debouncedListrikSearch.trim().toLowerCase();
  const filteredListrikData = qListrik
    ? listrikData.filter((it: any) => {
        return (
          String(it.station || "")
            .toLowerCase()
            .includes(qListrik) ||
          String(it.nama || "")
            .toLowerCase()
            .includes(qListrik) ||
          String(it.pic || "")
            .toLowerCase()
            .includes(qListrik) ||
          String(it.id ?? "")
            .toLowerCase()
            .includes(qListrik)
        );
      })
    : listrikData;

  const listrikPageCount = Math.ceil(filteredListrikData.length / itemsPerPage);
  const currentListrikItems = filteredListrikData.slice(
    listrikPage * itemsPerPage,
    (listrikPage + 1) * itemsPerPage,
  );

  return (
    <section className="space-y-6">
      {/* Premium Toolbar Area */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-dark_accent/30 dark:bg-darkSecondary/30">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Manajemen Pengajuan & Operasional
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kelola pengajuan biaya internet dan token listrik stasiun</p>
            </div>
            
            <ActionModal
              action="add"
              type={activeTab === "internet" ? "pengajuan-internet" : "pengajuan-listrik"}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t border-slate-100 dark:border-dark_accent/20 pt-6">
            {/* Tabs Style Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-darkSecondary/50 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("internet")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "internet"
                    ? "bg-white dark:bg-primary shadow-sm text-primary dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Globe className="h-4 w-4" />
                Internet ({internetData.length})
              </button>
              <button
                onClick={() => setActiveTab("listrik")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "listrik"
                    ? "bg-white dark:bg-primary shadow-sm text-primary dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Zap className="h-4 w-4" />
                Listrik ({listrikData.length})
              </button>
            </div>

            {/* Contextual Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === "internet" ? "Cari Pengajuan Internet..." : "Cari Pengajuan Listrik..."}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white transition-all shadow-sm"
                value={activeTab === "internet" ? internetSearch : listrikSearch}
                onChange={(e) => activeTab === "internet" ? setInternetSearch(e.target.value) : setListrikSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {activeTab === "internet" ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
              {internetQuery.isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p>Memuat data...</p>
                </div>
              ) : internetQuery.isError ? (
                <div className="flex h-[200px] items-center justify-center text-red-500">
                  Error:{" "}
                  {(internetQuery.error as any)?.message || "Terjadi kesalahan"}
                </div>
              ) : (
                <>
                  <DataTable
                    columns={internetColumns}
                    data={currentInternetItems}
                    type="pengajuan-internet"
                  />
                  <div className="mt-4 flex justify-center">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=" >"
                      onPageChange={(e) => setInternetPage(e.selected)}
                      pageRangeDisplayed={3}
                      pageCount={internetPageCount}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                      className="flex gap-2"
                      activeClassName="font-bold text-primary"
                      pageClassName="px-2"
                      previousClassName="px-2"
                      nextClassName="px-2"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
              {listrikQuery.isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p>Memuat data...</p>
                </div>
              ) : listrikQuery.isError ? (
                <div className="flex h-[200px] items-center justify-center text-red-500">
                  Error:{" "}
                  {(listrikQuery.error as any)?.message || "Terjadi kesalahan"}
                </div>
              ) : (
                <>
                  <DataTable
                    columns={listrikColumns}
                    data={currentListrikItems}
                    type="pengajuan-listrik"
                  />
                  <div className="mt-4 flex justify-center">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel=" >"
                      onPageChange={(e) => setListrikPage(e.selected)}
                      pageRangeDisplayed={3}
                      pageCount={listrikPageCount}
                      previousLabel="<"
                      renderOnZeroPageCount={null}
                      className="flex gap-2"
                      activeClassName="font-bold text-primary"
                      pageClassName="px-2"
                      previousClassName="px-2"
                      nextClassName="px-2"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
