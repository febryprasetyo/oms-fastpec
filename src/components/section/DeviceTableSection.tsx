"use client";
import React from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDeviceTableList } from "@/services/api/device";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import AddDeviceModal from "../features/modal/AddDeviceModal";

type Props = {};

export default function DeviceTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const {
    data: device,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["device"],
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

    {
      accessorKey: "nama_stasiun",
      header: "Nama Stasiun",
    },
  ];

  return (
    <>
      {device?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">Mesin</h1>
            <AddDeviceModal />
          </div>
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {device && !isError && (
              <DataTable
                columns={columns}
                data={device?.data.values}
                type="device"
              />
            )}
            {isLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {isError && (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-xl text-red-500">
                  Gagal memuat data: {error?.message} , Coba muat ulang halaman
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
