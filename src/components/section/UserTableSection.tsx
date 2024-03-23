"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUserList } from "@/services/api/user";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import UserModal from "../features/actionButton/ActionModal";
import ReactPaginate from "react-paginate";
import LimitPage from "../features/limitPage/LimitPage";

type Props = {};

export default function UserTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(accessToken as string);
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
  const currentItems = user?.data?.values.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((user?.data.values.length ?? 0) / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) % (user?.data.values.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <>
      {user?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">User</h1>
            {user?.success && !isError && (
              <UserModal action="add" type="user" />
            )}
          </div>
          {user?.success && !isError && (
            <div className="flex w-full justify-end">
              <div className="flex gap-3">
                <LimitPage
                  itemsPerPage={itemsPerPage}
                  setItemPerPage={setItemsPerPage}
                />
              </div>
            </div>
          )}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {user?.success && !isError && (
              <DataTable
                columns={columns}
                data={currentItems || user?.data?.values}
                type="user"
              />
            )}

            {isLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!user?.success && (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-red-500">
                  Gagal memuat data: {error?.message || "Network Error"} , Coba
                  muat ulang halaman
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
      )}
    </>
  );
}
