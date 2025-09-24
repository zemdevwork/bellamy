"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState, useCallback } from "react";
import { User } from "./Columns";
import { getAllUsers } from "@/server/actions/admin-user-action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface DataTableProps {
  columns: ColumnDef<User, unknown>[];
}

export function DataTable({ columns }: DataTableProps) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // page size
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Filters
  const [globalFilter, setGlobalFilter] = useState("");
  const [status, setStatus] = useState<"active" | "banned" | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [joinedDate, setJoinedDate] = useState<Date | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({
        page,
        limit,
        search: globalFilter,
        status,
        sort: sortOrder,
        // ✅ pass date filter
        joinedDate: joinedDate ? format(joinedDate, "yyyy-MM-dd") : undefined,
      });

      if (res.success) {
        const safeUsers: User[] = res.users.map((u: unknown) => {
          const user = u as Record<string, unknown>;
          return {
            ...user,
            createdAt: new Date(user.createdAt as string).toISOString(),
            banExpires: user.banExpires ? new Date(user.banExpires as string).toISOString() : null,
          } as User;
        });

        setData(safeUsers);

        if (res.pagination?.totalPages) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, globalFilter, status, sortOrder, joinedDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <Input
          placeholder="Search by name, email or phone..."
          value={globalFilter}
          onChange={(e) => {
            setPage(1);
            setGlobalFilter(e.target.value);
          }}
          className="max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            onValueChange={(val: "active" | "banned" | "all") => {
              setPage(1);
              setStatus(val === "all" ? undefined : val);
            }}
            defaultValue="all"
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          

          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </Button>

          {/* Joined Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {joinedDate ? format(joinedDate, "PPP") : "Joined Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-2">
              <Calendar
                mode="single"
                selected={joinedDate}
                onSelect={(date) => {
                  setPage(1);
                  setJoinedDate(date || undefined);
                }}
              />
              {joinedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full flex items-center gap-1 text-red-500"
                  onClick={() => setJoinedDate(undefined)}
                >
                  <X className="h-4 w-4" /> Clear Date
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}