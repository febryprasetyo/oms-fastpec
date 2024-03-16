"use client";
import { useState } from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getStationList } from "@/services/api/station";
import { useSession } from "next-auth/react";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import StationModal from "../features/modal/StationModal";
import LimitPage from "../features/limitPage/LimitPage";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";

type Props = {};

export default function StationTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [itemOffset, setItemOffset] = useState<number>(0);

  const {
    data: station,
    isLoading: stationLoading,
    isError: stationError,
    error,
  } = useQuery({
    queryKey: ["station"],
    queryFn: () => {
      return getStationList(accessToken as string);
    },
  });

  const columns: ColumnDef<StationData>[] = [
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
  const currentItems = station?.data?.values.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(
    (station?.data.values.length ?? 0) / itemsPerPage,
  );

  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) % (station?.data.values.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <>
      {station?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">Stasiun</h1>
            {station?.success && !stationError && <StationModal action="add" />}
          </div>
          {station?.success && !stationError && (
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
            {station?.success && !stationError ? (
              <DataTable
                columns={columns}
                data={currentItems || station?.data?.values}
                type="station"
              />
            ) : null}

            {stationLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!station?.success && (
              <div className="flex h-[400px] items-center justify-center">
                <p className=" text-red-500">
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
