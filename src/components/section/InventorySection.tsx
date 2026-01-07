"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import ActionModal from "../features/actionButton/ActionModal";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";
import { getInventoryTableList } from "@/services/api/inventory";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus, ListFilter, LayoutGrid } from "lucide-react";

type Props = {
  cookie: string;
};

export default function InventorySection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when search changes
  useEffect(() => {
    setItemOffset(0);
  }, [debouncedSearch]);

  const inventoryQuery = useQuery({
    queryKey: ["inventory", debouncedSearch],
    queryFn: () => getInventoryTableList(cookie, debouncedSearch),
  });

  const columns: ColumnDef<InventoryTableData>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "products", header: "Nama Barang" },
    { accessorKey: "serial_number", header: "Serial Number" },
    {
      accessorKey: "condition",
      header: "Kondisi",
      cell: ({ row }) => {
        const condition = row.getValue("condition")?.toString().toLowerCase();

        const colorCell =
          condition === "baru"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 capitalize"
            : condition === "bekas"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 capitalize"
              : condition === "rusak"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 capitalize"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 capitalize";

        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${colorCell}`}
          >
            {row.getValue("condition")}
          </span>
        );
      },
    },
    {
      accessorKey: "date_in",
      header: "Tanggal Masuk",
      cell: ({ row }) => {
        const rawDate = row.getValue("date_in") as string | null | undefined;
        return rawDate ? moment(String(rawDate)).format("DD/MM/YYYY") : "-";
      },
    },
    {
      accessorKey: "date_out",
      header: "Tanggal Keluar",
      cell: ({ row }) => {
        const rawDate = row.getValue("date_out") as string | null | undefined;
        return rawDate ? moment(String(rawDate)).format("DD/MM/YYYY") : "-";
      },
    },
  ];

  const dataArray = Array.isArray(inventoryQuery?.data?.data)
    ? inventoryQuery.data.data
    : [];

  // Client-side filtering
  const filteredData = dataArray.filter((item) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      item.products?.toLowerCase().includes(searchLower) ||
      item.serial_number?.toLowerCase().includes(searchLower) ||
      item.condition?.toLowerCase().includes(searchLower)
    );
  });

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredData.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % filteredData.length;
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-6">
      {/* Premium Toolbar Area */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-dark_accent/30 dark:bg-darkSecondary/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Manajemen Inventaris
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kelola stok barang, alat, dan perangkat monitoring</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama Barang atau Serial..."
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {inventoryQuery?.data?.success && !inventoryQuery?.isError && (
              <ActionModal action="add" type="inventory" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {inventoryQuery?.data?.success && !inventoryQuery?.isError && (
          <DataTable columns={columns} data={currentItems} type="inventory" />
        )}

        {inventoryQuery?.isLoading && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <p className="text-lg">Memuat data...</p>
          </div>
        )}

        {!inventoryQuery?.data?.success && !inventoryQuery?.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-red-500">
              Gagal memuat data:{" "}
              {inventoryQuery?.error?.message || "Network Error"}, coba muat
              ulang halaman
            </p>
          </div>
        )}

        <div className="overflow-auto" id="pagination">
          <ReactPaginate
            breakLabel="..."
            nextLabel=" >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            breakClassName="text-xl"
            className="mt-5 flex items-center justify-center gap-3 py-2"
            activeClassName="bg-primary text-white dark:bg-primary dark:text-white flex items-center justify-center rounded-lg text-lg"
            pageLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
            nextLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
            previousLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
            disabledLinkClassName="text-gray-400 dark:text-gray-400 size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent cursor-not-allowed hover:bg-transparent hover:text-gray-400 dark:hover:text-gray-400 dark:hover:bg-transparent"
          />
        </div>
      </div>
    </section>
  );
}
