"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getUserList } from "@/services/api/user";
import UserModal from "../features/actionButton/ActionModal";
import ReactPaginate from "react-paginate";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";
import { Search, Users, Plus, ListFilter, UserPlus } from "lucide-react";

type Props = {
  cookie: string;
};

export default function UserTableSection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(cookie);
    },
  });

  const columns: ColumnDef<UserTableData>[] = [
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

  // Display only users from the 'user' array, or use values array for backward compatibility
    const allUsers = (userQuery?.data?.data?.values || userQuery?.data?.data?.user || []) as any[];

  const filteredUsers = allUsers.filter((u: any) => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nama_dinas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredUsers.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((filteredUsers.length ?? 0) / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % (filteredUsers.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-6">
      {/* Premium Toolbar Area */}
      <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-dark_accent/30 dark:bg-darkSecondary/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Manajemen Pengguna
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total {filteredUsers.length} pengguna terdaftar di sistem</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Username atau Dinas..."
                className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none dark:bg-darkSecondary dark:border-dark_accent dark:text-white transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <LimitPageCSR limit={itemsPerPage} setLimit={setItemsPerPage} />
              {userQuery?.data?.success && !userQuery?.isError && (
                <UserModal action="add" type="user" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {userQuery?.data?.success && !userQuery?.isError && (
          <DataTable
            columns={columns}
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
