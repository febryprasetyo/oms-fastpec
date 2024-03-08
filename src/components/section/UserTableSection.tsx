"use client";
import React from "react";
import AddStationModal from "../features/modal/AddStationModal";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUserList } from "@/services/api/userList";

type Props = {};

export default function UserTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getUserList(accessToken as string);
      return res;
    },
  });

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Username",
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
