"use client";
import React, { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getDeviceTableList } from "@/services/api/device";
import ReactPaginate from "react-paginate";
import ActionModal from "../features/actionButton/ActionModal";
import LimitPageCSR from "../features/limitPage/LimitPageCSR";

type Props = {
  cookie: string;
};

export default function DeviceTableSection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

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

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = deviceQuery?.data?.data?.values.slice(
    itemOffset,
    endOffset,
  );
  const pageCount = Math.ceil(
    (deviceQuery?.data?.data?.values.length ?? 0) / itemsPerPage,
  );

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      (deviceQuery?.data?.data?.values.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Mesin</h1>
        {deviceQuery?.data?.success && !deviceQuery?.isError && (
          <ActionModal action="add" type="device" />
        )}
      </div>
      {deviceQuery?.data?.success && !deviceQuery?.isError && (
        <div className="flex w-full justify-end">
          <div className="flex gap-3">
            <LimitPageCSR limit={itemsPerPage} setLimit={setItemsPerPage} />
          </div>
        </div>
      )}
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {deviceQuery?.data?.success && !deviceQuery?.isError && (
          <DataTable
            columns={columns}
            data={currentItems || deviceQuery?.data?.data.values}
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
