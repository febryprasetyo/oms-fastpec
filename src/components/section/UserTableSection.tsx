"use client";
import React from "react";
import { DataTable } from "../features/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getUserList } from "@/services/api/user";
import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import UserModal from "../features/modal/UserModal";

type Props = {};

export default function UserTableSection({}: Props) {
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return getUserList(accessToken as string);
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
      accessorKey: "nama_dinas",
      header: "Nama Dinas",
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
            {user?.success && !isError && <UserModal action="add" />}
          </div>
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {user?.success && !isError && (
              <DataTable
                columns={columns}
                data={user?.data?.values}
                type="user"
              />
            )}

            {isLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!user?.success ||
              (isError && (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-red-500">
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
