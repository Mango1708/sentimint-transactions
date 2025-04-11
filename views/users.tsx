/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ImageUp, Send, CircleX, DownloadCloud, Loader } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USERS } from "@/app/data/users";
// import data from '@/transactions.json';

export type Users = {
  accountAddress: string;
  createdAt: string;
  displayName?: string;
  picture?: string;
  email?: string;
};

export const functions = [
  {
    value: "red_package::seal_memory",
    label: "Seal memory",
    icon: ImageUp,
  },
  {
    value: "transfer_coins",
    label: "Transfer coin",
    icon: Send,
  },
];

export const columns: ColumnDef<Users>[] = [
  {
    id: "accountAddress",
    accessorKey: "accountAddress",
    header: "User Address",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("accountAddress")}</div>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const dateTime = dayjs(row.getValue("createdAt")).format(
        "MM/DD/YYYY HH:mm:ss"
      );
      return <div className="font-medium">{dateTime}</div>;
    },
  },
];

export function Users() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [downloading, setDownloading] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data: USERS as any,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleExport = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/export-users`);
      if (!response.ok) {
        throw new Error("Error exporting users");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-start py-4 gap-4 flex-col md:flex-row ">
        <div className="flex relative">
          <Input
            placeholder="Filter user by accountAddress..."
            value={
              (table.getColumn("accountAddress")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("accountAddress")
                ?.setFilterValue(event.target.value)
            }
            className="w-[200px] pr-10 md:w-[400px]"
          />
          {(table.getColumn("accountAddress")?.getFilterValue() as string) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full hover:bg-transparent active:bg-transparent cursor-pointer"
              onClick={() =>
                table.getColumn("accountAddress")?.setFilterValue("")
              }
            >
              <CircleX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          className="md:ml-auto cursor-pointer"
          onClick={() => handleExport()}
        >
          Export CSV{" "}
          {!downloading ? (
            <Loader
              className="animate-spin
"
            />
          ) : (
            <DownloadCloud />
          )}
        </Button>
      </div>
      <div className="rounded-md border">
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
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} users.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
