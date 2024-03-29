"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDatabaseList } from "@/services/api/database";
import ReactPaginate from "react-paginate";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import UnAuthorizedModal from "../features/modal/UnAuthorizedModal";
import LimitPage from "../features/limitPage/LimitPage";

type Props = {};

export default function DatabaseTableSection({}: Props) {
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(10);
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const endOffset = itemOffset + itemsPerPage;

  const {
    data: database,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["database"],
    queryFn: () => {
      return getDatabaseList(accessToken as string);
    },
    enabled: false,
    refetchInterval: false,
  });

  const currentItems = database?.data.toReversed().slice(itemOffset, endOffset);
  const pageCount = Math.ceil((database?.data.length ?? 0) / itemsPerPage);
  const handlePageClick = (event: any) => {
    const newOffset =
      (event.selected * itemsPerPage) % (database?.data.length ?? 0);
    setItemOffset(newOffset);
  };

  return (
    <>
      {database?.statusCode === 401 ? (
        <UnAuthorizedModal />
      ) : (
        <section className="space-y-5">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">Database</h1>
            <LimitPage
              itemsPerPage={itemsPerPage}
              setItemPerPage={setItemPerPage}
            />
          </div>
          <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
            {database?.success && !isError && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead className="min-w-[180px]">
                        ID Stasiun
                      </TableHead>
                      <TableHead className="min-w-[150px]">Tanggal</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead className="min-w-[100px]">Suhu</TableHead>
                      <TableHead>TDS</TableHead>
                      <TableHead>DO</TableHead>
                      <TableHead>PH</TableHead>
                      <TableHead>Turbidity</TableHead>
                      <TableHead>Kedalaman</TableHead>
                      <TableHead>Nitrat</TableHead>
                      <TableHead>Amonia</TableHead>
                      <TableHead>COD</TableHead>
                      <TableHead>BOD</TableHead>
                      <TableHead>TSS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems?.map((item, index) => {
                      const { data }: { data: payload } = JSON.parse(
                        item?.payload,
                      );
                      return (
                        <TableRow key={index}>
                          <TableCell>{itemOffset + index + 1}</TableCell>
                          <TableCell className="w-[200px]">
                            {data.IDStasiun == undefined ? "-" : data.IDStasiun}
                          </TableCell>
                          <TableCell>
                            {data.Tanggal == undefined ? "-" : data.Tanggal}
                          </TableCell>
                          <TableCell>
                            {data.Jam == undefined ? "-" : data.Jam}
                          </TableCell>
                          <TableCell>
                            {data.Suhu == undefined ? "-" : data.Suhu}
                          </TableCell>
                          <TableCell>
                            {data.TDS == undefined ? "-" : data.TDS}
                          </TableCell>
                          <TableCell>
                            {data.DO == undefined ? "-" : data.DO}
                          </TableCell>
                          <TableCell>
                            {data.PH == undefined ? "-" : data.PH}
                          </TableCell>
                          <TableCell>
                            {data.Turbidity == undefined ? "-" : data.Turbidity}
                          </TableCell>
                          <TableCell>
                            {data.Kedalaman == undefined ? "-" : data.Kedalaman}
                          </TableCell>
                          <TableCell>
                            {data.Nitrat == undefined ? "-" : data.Nitrat}
                          </TableCell>
                          <TableCell>
                            {data.Amonia ? data.Amonia : "-"}
                          </TableCell>
                          <TableCell>
                            {data.COD == undefined ? "-" : data.COD}
                          </TableCell>
                          <TableCell>
                            {data.BOD == undefined ? "-" : data.BOD}
                          </TableCell>
                          <TableCell>
                            {data.TSS == undefined ? "-" : data.TSS}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
                    pageLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                    nextLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                    previousLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent"
                    disabledLinkClassName="text-gray-400 dark:text-gray-400 size-10 flex items-center justify-center rounded-lg text-lg border dark:border-dark_accent cursor-not-allowed hover:bg-transparent hover:text-gray-400 dark:hover:text-gray-400 dark:hover:bg-transparent"
                  />
                </div>
              </>
            )}
            {isLoading && (
              <div className="flex h-[400px] animate-pulse items-center justify-center">
                <p className="text-lg">Memuat data...</p>
              </div>
            )}
            {!database?.success && (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-red-500">
                  Gagal memuat data: {error?.message || "Network Error"} , Coba
                  muat ulang halaman
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
