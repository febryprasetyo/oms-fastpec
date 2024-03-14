"use client";
import React from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getStationList } from "@/services/api/station";
import { useSession } from "next-auth/react";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import StationModal from "../features/modal/StationModal";

type Props = {};

export default function StationTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

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
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {station?.success && !stationError ? (
              <DataTable
                columns={columns}
                data={station?.data?.values}
                type="station"
              />
            ) : null}

            {stationLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!station?.success ||
              (stationError && (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-lg text-red-500">
                    Gagal memuat data: {error?.message} , Coba muat ulang
                    halaman
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}
    </>
  );
}
