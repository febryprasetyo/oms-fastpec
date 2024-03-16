"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDeviceTableList } from "@/services/api/device";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import DeviceModal from "../features/modal/DeviceModal";
import ReactPaginate from "react-paginate";
import LimitPage from "../features/limitPage/LimitPage";

type Props = {};

export default function DeviceTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

  const {
    data: device,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mesin"],
    queryFn: () => {
      return getDeviceTableList(accessToken as string);
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

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = device?.data?.values.slice(itemOffset, endOffset);
  const pageCount = Math.ceil((device?.data.values.length ?? 0) / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) % (device?.data.values.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <>
      {device?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">Mesin</h1>
            {device?.success && !isError && <DeviceModal action="add" />}
          </div>
          {device?.success && !isError && (
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
            {device?.success && !isError && (
              <DataTable
                columns={columns}
                data={currentItems || device.data.values}
                type="device"
              />
            )}
            {isLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!device?.success && (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-red-500">
                  Gagal memuat data : {error?.message || "Network Error"} , Coba
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
