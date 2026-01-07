"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getDeviceTableList } from "@/services/api/device";
import ReactPaginate from "react-paginate";
import ActionModal from "../features/actionButton/ActionModal";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";
import { Search, Cpu, Plus, ListFilter } from "lucide-react";

type Props = {
  cookie: string;
};

export default function DeviceTableSection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const deviceQuery = useQuery({
    queryKey: ["device"],
    queryFn: () => {
      return getDeviceTableList(cookie);
    },
  });

  const columns: ColumnDef<DeviceTableData>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "nama_stasiun",
      header: "Nama Stasiun",
    },

    {
      accessorKey: "id_mesin",
      header: "ID Mesin",
    },
    {
      accessorKey: "dinas_id",
      header: "ID Dinas",
    },
    {
      accessorKey: "nama_dinas",
      header: "Nama Dinas",
    },
  ];

  const values = (deviceQuery?.data?.data?.values || []) as any[];

  const filteredValues = values.filter((d: any) => 
    d.nama_stasiun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id_mesin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.nama_dinas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredValues.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((filteredValues.length ?? 0) / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % (filteredValues.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-6">
      {/* Premium Toolbar Area */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-dark_accent/30 dark:bg-darkSecondary/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Manajemen Perangkat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total {filteredValues.length} perangkat terdaftar aktif</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Stasiun, ID Mesin, atau Dinas..."
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <LimitPageCSR limit={itemsPerPage} setLimit={setItemsPerPage} />
              {deviceQuery?.data?.success && !deviceQuery?.isError && (
                <ActionModal action="add" type="device" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {deviceQuery?.data?.success && !deviceQuery?.isError && (
          <DataTable
            columns={columns}
            data={currentItems}
            type="device"
          />
        )}
        {deviceQuery?.isLoading && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <p className="text-lg">Memuat data...</p>
          </div>
        )}
        {!deviceQuery?.data?.success && !deviceQuery?.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-red-500">
              Gagal memuat data :{" "}
              {deviceQuery?.error?.message || "Network Error"} , Coba muat ulang
              halaman
            </p>
          </div>
        )}
        <div className="overflow-auto " id="pagination">
          <ReactPaginate
            breakLabel="..."
            nextLabel=" >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel="<"
            renderOnZeroPageCount={null}
            breakClassName="text-xl"
            className=" mt-5 flex items-center justify-center gap-3 py-2"
            activeClassName="bg-primary text-white dark:bg-primary dark:text-white flex items-center justify-center rounded-lg text-lg"
            pageLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent "
            nextLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
            previousLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
            disabledLinkClassName="text-gray-400 dark:text-gray-400 size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent cursor-not-allowed hover:bg-transparent hover:text-gray-400 dark:hover:text-gray-400 dark:hover:bg-transparent"
          />
        </div>
      </div>
    </section>
  );
}
