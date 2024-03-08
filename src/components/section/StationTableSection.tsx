"use client";
import React from "react";
import AddStationModal from "../features/modal/AddStationModal";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getStationList } from "@/services/api/stationList";
import { useSession } from "next-auth/react";

type Props = {};

export default function StationTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stasiun"],
    queryFn: async () => {
      const res = await getStationList(accessToken as string);
      return res;
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
      accessorKey: "province_name",
      header: "Provinsi",
    },
    {
      accessorKey: "city_name",
      header: "Kota",
    },
  ];
  return (
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Stasiun</h1>
        <AddStationModal />
      </div>
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {data ? (
          <DataTable
            columns={columns}
            data={data?.data?.values}
            caption="List Stasiun"
          />
        ) : null}
      </div>
    </section>
  );
}
