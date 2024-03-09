"use client";
import React from "react";
import AddStationModal from "../features/modal/AddStationModal";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDeviceTableList } from "@/services/api/device";

type Props = {};

export default function DeviceTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["device"],
    queryFn: async () => {
      const res = await getDeviceTableList(accessToken as string);
      return res;
    },
  });

  const columns: ColumnDef<DeviceData>[] = [
    {
      accessorKey: "id_mesin",
      header: "ID Mesin",
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
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Mesin</h1>
        <AddStationModal />
      </div>
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {data ? (
          <DataTable
            columns={columns}
            data={data.data.values}
            caption="List Mesin yang tersedia"
          />
        ) : null}
      </div>
    </section>
  );
}
