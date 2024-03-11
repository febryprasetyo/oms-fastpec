"use client";
import React from "react";
import AddStationModal from "../features/modal/AddStationModal";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUserList } from "@/services/api/user";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";

type Props = {};

export default function UserTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(accessToken as string);
    },
  });

  const columns: ColumnDef<UserData>[] = [
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
    <>
      {user?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">User</h1>
            <AddStationModal />
          </div>
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {user ? (
              <DataTable columns={columns} data={user?.data?.values} />
            ) : null}
          </div>
        </section>
      )}
    </>
  );
}
