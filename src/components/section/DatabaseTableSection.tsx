"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDatabaseList } from "@/services/api/database";
import ReactPaginate from "react-paginate";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {};

export default function DatabaseTableSection({}: Props) {
  const [itemOffset, setItemOffset] = useState<number>(0);
  const [itemsPerPage, setItemPerPage] = useState<number>(10);
  const session = useSession();
  const accessToken = session.data?.user.token.access_token;

  const endOffset = itemOffset + itemsPerPage;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["database"],
    queryFn: async () => {
      const res = await getDatabaseList(accessToken as string);
      return res;
    },
    enabled: false,
    refetchInterval: false,
  });

  const currentItems = data?.data.slice(itemOffset, endOffset);
  // @ts-ignore
  const pageCount = Math.ceil(data?.data.length / itemsPerPage);

  const handlePageClick = (event: any) => {
    // @ts-ignore
    const newOffset = (event.selected * itemsPerPage) % data?.data.length;
    setItemOffset(newOffset);
  };

  return (
    <section className="space-y-5">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Database</h1>
        <Select
          defaultValue={itemsPerPage}
          onValueChange={(e) => {
            const value = parseInt(e);
            setItemPerPage(value);
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={10} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={5}>5</SelectItem>
              <SelectItem value={10} defaultChecked>
                10
              </SelectItem>
              <SelectItem value={20}>20</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl bg-white p-5 shadow dark:bg-darkSecondary">
        {data && !isError && (
          <>
            <Table>
              <TableCaption>List Database</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead className="min-w-[180px]">ID Stasiun</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead className="min-w-[100px]">Suhu</TableHead>
                  <TableHead>DHL</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Salinitas</TableHead>
                  <TableHead>DO</TableHead>
                  <TableHead>PH</TableHead>
                  <TableHead>Turbidity</TableHead>
                  <TableHead>Kedalaman</TableHead>
                  <TableHead>SwSG</TableHead>
                  <TableHead>Nitrat</TableHead>
                  <TableHead>Amonia</TableHead>
                  <TableHead>ORP</TableHead>
                  <TableHead>COD</TableHead>
                  <TableHead>BOD</TableHead>
                  <TableHead>TSS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems?.map((item, index) => {
                  const { data }: { data: payload } = JSON.parse(item?.payload);
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
                        {data.DHL == undefined ? "-" : data.DHL}
                      </TableCell>
                      <TableCell>
                        {data.TDS == undefined ? "-" : data.TDS}
                      </TableCell>
                      <TableCell>
                        {data.Salinitas == undefined ? "-" : data.Salinitas}
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
                        {data.SwSG == undefined ? "-" : data.SwSG}
                      </TableCell>
                      <TableCell>
                        {data.Nitrat == undefined ? "-" : data.Nitrat}
                      </TableCell>
                      <TableCell>{data.Amonia ? data.Amonia : "-"}</TableCell>
                      <TableCell>
                        {data.ORP == undefined ? "-" : data.ORP}
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
                className=" mt-5 flex items-center justify-center gap-3 py-5"
                activeClassName="bg-primary text-white dark:bg-primary dark:text-white flex items-center justify-center rounded-md text-lg"
                pageLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white py-1 px-3 flex items-center justify-center rounded-md text-lg border dark:border-dark_accent"
                nextLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white py-1 px-3 flex items-center justify-center rounded-md text-lg border dark:border-dark_accent"
                previousLinkClassName="hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white py-1 px-3 flex items-center justify-center rounded-md text-lg border dark:border-dark_accent"
                disabledLinkClassName="text-gray-400 dark:text-gray-400 py-1 px-3 flex items-center justify-center rounded-md text-lg border dark:border-dark_accent cursor-not-allowed hover:bg-transparent hover:text-gray-400 dark:hover:text-gray-400 dark:hover:bg-transparent"
              />
            </div>
          </>
        )}
        {isLoading && (
          <div className="flex min-h-[300px] w-full items-center justify-center">
            <p className="text-xl font-medium">Memuat Data</p>
          </div>
        )}
        {isError && (
          <div className="flex min-h-[300px] w-full items-center justify-center">
            <p className="text-xl font-medium">Gagal Memuat Data</p>
          </div>
        )}
      </div>
    </section>
  );
}
