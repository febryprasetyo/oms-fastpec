"use client";
import { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getStationList } from "@/services/api/station";
import LimitPage from "../features/limitPage/LimitPage";
import ReactPaginate from "react-paginate";
import ActionModal from "../features/actionButton/ActionModal";

type Props = {
  cookie: string;
};

export default function StationTableSection({ cookie }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

  const stationQuery = useQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(cookie);
    },
  });

  const columns: ColumnDef<StationTableData>[] = [
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
      accessorKey: "address",
      header: "Alamat",
    },
    {
      accessorKey: "province_id",
      header: "ID Provinsi",
    },
    {
      accessorKey: "province_name",
      header: "Provinsi",
    },
    {
      accessorKey: "city_id",
      header: "ID Kota",
    },
    {
      accessorKey: "city_name",
      header: "Kota",
    },
  ];
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = stationQuery?.data?.data?.values.slice(
    itemOffset,
    endOffset,
  );
  const pageCount = Math.ceil(
    (stationQuery?.data?.data?.values?.length ?? 0) / itemsPerPage,
  );

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      (stationQuery?.data?.data?.values?.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Stasiun</h1>
        {stationQuery?.data?.success && !stationQuery?.isError && (
          <ActionModal action="add" type="station" />
        )}
      </div>
      {stationQuery?.data?.success && !stationQuery?.isError && (
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
        {stationQuery?.data?.success && !stationQuery?.isError ? (
          <DataTable
            columns={columns}
            data={currentItems || stationQuery?.data?.data?.values}
            type="station"
          />
        ) : null}

        {stationQuery?.isLoading && (
          <div className="flex h-[400px] animate-pulse items-center justify-center">
            <p className="text-lg">Memuat data...</p>
          </div>
        )}
        {stationQuery?.isError && !stationQuery.isPending && (
          <div className="flex h-[400px] items-center justify-center">
            <p className=" text-red-500">
              Gagal memuat data:{" "}
              {stationQuery?.error?.message || "Network Error"} , Coba muat
              ulang halaman
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
