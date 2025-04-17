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
import { TRANSACTIONS } from "@/app/data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
// import data from '@/transactions.json';

export type Transaction = {
  user_transaction: {
    sender: string;
    entry_function_id_str: string;
    timestamp: string;
  };
  transaction_version: number;
  function: string;
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

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "version",
    accessorKey: "transaction_version",
    header: "Version",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          <Link
            className="text-blue-400 cursor-pointer"
            href={`https://explorer.movementnetwork.xyz/txn/${row.getValue(
              "version"
            )}?network=bardock+testnet`}
            target="_blank"
          >
            {row.getValue("version")}
          </Link>
        </div>
      );
    },
  },
  {
    id: "timestamp",
    accessorFn: (row) => row.user_transaction.timestamp,
    header: "Timestamp",
    cell: ({ row }) => {
      const dateTime = dayjs(row.getValue("timestamp")).format(
        "MM/DD/YYYY HH:mm:ss"
      );
      return <div className="font-medium">{dateTime}</div>;
    },
  },
  {
    id: "sender",
    accessorFn: (row) => row.user_transaction.sender,
    header: "Sender",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("sender")}</div>;
    },
  },
  {
    id: "function",
    accessorFn: (row) => row.function,
    header: "Function",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("function")}</div>;
    },
  },
];

export function Transactions() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [downloading, setDownloading] = React.useState(false);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data: TRANSACTIONS,
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

  const handleExport = async (type: "All" | "Memories") => {
    try {
      setDownloading(true);
      const response = await fetch(`/export-transactions?type=${type}`);
      if (!response.ok) {
        throw new Error("Error exporting transactions");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "All"
          ? "transactions.xlsx"
          : "seal_memories_transactions.xlsx";
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
      {/* <button
        onClick={() => {
          (data as any).transactions.forEach((tx:any) => {
            const entryFunc = tx.user_transaction.entry_function_id_str;
            let funcValue = "";
            
            if (entryFunc && entryFunc.includes("red_package")) {
              const index = entryFunc.indexOf("red_package");
              funcValue = entryFunc.substring(index);
            } else if (entryFunc) {
              const segments = entryFunc.split("::");
              funcValue = segments[segments.length - 1];
            }
            
            tx.function = funcValue;
          });
          (data as any).transactions.reverse();
          
          console.log(data);
        }}
      >
        Click
      </button> */}
      <button onClick={()=> {
        const data:any=[]
        TRANSACTIONS.forEach((tx:any) => {
          if(tx.user_transaction.sender !== "0x556b39a90e8e86bc27dce1e9f25a794e2c41407091d52cd3788f9e5971e48727") {
            data.push(tx.user_transaction.sender)
          }
        })
        const result =[...new Set(data)]
        const finalData = result.map((rs) => ({
          address: rs
        }))
        console.log("🚀 ~ Transactions ~ result:", finalData)
      }}>Get Onchain User</button>
      <div className="flex items-start py-4 gap-4 flex-col md:flex-row ">
        <div className="flex relative ">
          <Input
            placeholder="Filter transaction by sender..."
            value={
              (table.getColumn("sender")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("sender")?.setFilterValue(event.target.value)
            }
            className="w-[200px] pr-10 md:w-[400px]"
          />
          {(table.getColumn("sender")?.getFilterValue() as string) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full hover:bg-transparent active:bg-transparent cursor-pointer"
              onClick={() => table.getColumn("sender")?.setFilterValue("")}
            >
              <CircleX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableFacetedFilter
          column={table.getColumn("function")}
          title="Function"
          options={functions}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="md:ml-auto cursor-pointer">
              Export CSV{" "}
              {downloading ? (
                <Loader
                  className="animate-spin
"
                />
              ) : (
                <DownloadCloud />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="capitalize"
              onClick={() => handleExport("All")}
            >
              All Transactions
            </DropdownMenuItem>
            <DropdownMenuItem
              className="capitalize"
              onClick={() => handleExport("Memories")}
            >
              Seal Memories
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          {table.getFilteredRowModel().rows.length} transactions.
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
