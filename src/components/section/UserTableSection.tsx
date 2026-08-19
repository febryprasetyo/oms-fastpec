"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getUserList } from "@/services/api/user";
import ActionModal from "../features/actionButton/ActionModal";
import ReactPaginate from "react-paginate";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";
import { Search, Users, Building2, UserCheck } from "lucide-react";

type Props = {
  cookie: string;
};

export default function UserTableSection({ cookie }: Props) {
  const [activeTab, setActiveTab] = useState<"usr" | "eng">("usr");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(cookie);
    },
  });

  // Columns for User Dinas (Client)
  const dinasColumns: ColumnDef<UserTableData>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "nama_dinas",
      header: "Nama Dinas",
    },
    {
      accessorKey: "api_key",
      header: "API Key",
    },
    {
      accessorKey: "secret_key",
      header: "Secret Key",
    },
  ];

  // Columns for Engineering (Header "Nama", no API/Secret Key)
  const engineeringColumns: ColumnDef<UserTableData>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "nama_dinas",
      header: "Nama",
    },
  ];

  const rawData = userQuery?.data?.data;
  const rawUserList = (rawData?.user || rawData?.values || []).map((u: any) => ({
    ...u,
    role_id: u.role_id || "usr",
  })) as UserTableData[];
  const rawEngineeringList = (rawData?.engineering || []).map((u: any) => ({
    ...u,
    role_id: u.role_id || "eng",
  })) as UserTableData[];

  const currentDataset = activeTab === "usr" ? rawUserList : rawEngineeringList;

  const filteredUsers = currentDataset.filter((u: any) =>
    (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.nama_dinas || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredUsers.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((filteredUsers.length ?? 0) / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % (filteredUsers.length ?? 0);
    setItemOffset(newOffset);
  };

  const handleTabChange = (tab: "usr" | "eng") => {
    setActiveTab(tab);
    setItemOffset(0);
    setSearchTerm("");
  };

  return (
    <section className="space-y-6">
      {/* Premium Toolbar Area */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-dark_accent/30 dark:bg-darkSecondary/30">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Manajemen Pengguna
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola akun pengguna Dinas / Client dan akun Engineering
              </p>
            </div>

            <div className="flex items-center gap-3">
              <LimitPageCSR limit={itemsPerPage} setLimit={setItemsPerPage} />
              {userQuery?.data?.success && !userQuery?.isError && (
                <ActionModal action="add" type="user" defaultRole={activeTab} />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t border-slate-100 dark:border-dark_accent/20 pt-6">
            {/* Tabs Style Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-darkSecondary/50 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange("usr")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "usr"
                    ? "bg-white dark:bg-primary shadow-sm text-primary dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Building2 className="h-4 w-4" />
                User Dinas ({rawUserList.length})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("eng")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "eng"
                    ? "bg-white dark:bg-primary shadow-sm text-primary dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Engineering ({rawEngineeringList.length})
              </button>
            </div>

            {/* Contextual Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "usr"
                    ? "Cari Username atau Dinas..."
                    : "Cari Username atau Nama Engineering..."
                }
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {userQuery?.data?.success && !userQuery?.isError && (
          <DataTable
            columns={activeTab === "usr" ? dinasColumns : engineeringColumns}
            data={currentItems}
            type="user"
          />
        )}

        {userQuery?.isLoading && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <p className="text-lg">Memuat data...</p>
          </div>
        )}
        {!userQuery?.data?.success && !userQuery?.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-red-500">
              Gagal memuat data: {userQuery?.error?.message || "Network Error"}{" "}
              , Coba muat ulang halaman
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
