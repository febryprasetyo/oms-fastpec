"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getUserList } from "@/services/api/user";
import UserModal from "../features/actionButton/ActionModal";
import ReactPaginate from "react-paginate";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";

type Props = {
  cookie: string;
};

export default function UserTableSection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

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

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = userQuery?.data?.data?.values.slice(
    itemOffset,
    endOffset,
  );
  const pageCount = Math.ceil(
    (userQuery?.data?.data.values.length ?? 0) / itemsPerPage,
  );

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      (userQuery?.data?.data.values.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">User</h1>
        {userQuery?.data?.success && !userQuery?.isError && (
          <UserModal action="add" type="user" />
        )}
      </div>
      {userQuery?.data?.success && !userQuery?.isError && (
        <div className="flex w-full justify-end">
          <div className="flex gap-3">
            <LimitPageCSR limit={itemsPerPage} setLimit={setItemsPerPage} />
          </div>
        </div>
      )}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {userQuery?.data?.success && !userQuery?.isError && (
          <DataTable
            columns={columns}
            data={currentItems || userQuery?.data?.data?.values}
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
