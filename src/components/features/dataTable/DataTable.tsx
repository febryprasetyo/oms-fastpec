"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StationActionButton from "../actionButton/StationActionButton";
import DeviceActionButton from "../actionButton/DeviceActionButton";
import UserActionButton from "../actionButton/UserActionButton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  type: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  type,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
            <TableHead>Action</TableHead>
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length
          ? table.getRowModel().rows.map((row, index) => {
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        className={`${cell.column.id == "id" ? "font-semibold" : ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {type === "station" && (
                      <StationActionButton
                        id={row.getValue("id")}
                        default_nama_stasiun={row.getValue("nama_stasiun")}
                        default_address={row.getValue("address")}
                        default_nama_dinas={row.getValue("nama_dinas")}
                        default_device_id={row.getValue("device_id")}
                        default_province_id={row.getValue("province_id")}
                        default_city_id={row.getValue("city_id")}
                      />
                    )}
                    {type === "device" && (
                      <DeviceActionButton id={row.getValue("id")} />
                    )}

                    {type === "user" && (
                      <UserActionButton
                        id={row.getValue("id")}
                        default_username={row.getValue("username")}
                        default_nama_dinas={row.getValue("nama_dinas")}
                        default_api_key={row.getValue("api_key")}
                        default_secret_key={row.getValue("secret_key")}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          : null}
      </TableBody>
    </Table>
  );
}
