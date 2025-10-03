"use client";

import { Product, Brand, Category } from "@prisma/client";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, X, Package} from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Checkbox from "../ui/checkbox"; 
import { Badge } from "@/components/ui/badge";

import { BatchUpdateDialog } from "./batch-update-dialog";

// Extended Product type with relations
// Inventory table rows represent variant-level aggregates with product relations
export type ProductWithRelations = (Product & {
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  subCategory: { id: string; name: string } | null;
}) & {
  sku: string;
  options?: string;
  price: number;
  qty: number;
  isLowStock: boolean;
};

interface ProductsResponse {
  data: ProductWithRelations[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sortBy: string;
    sortOrder: string;
  };
}

interface InvenotryTableProps {
  columns: ColumnDef<ProductWithRelations>[];
  categories?: Category[];
  brands?: Brand[];
  onSelectionChange?: (selectedProducts: ProductWithRelations[]) => void;
}

export default function InvenotryTable({
  columns,
  categories = [],
  brands = [],
  onSelectionChange,
}: InvenotryTableProps) {
  const [data, setData] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedProducts, setSelectedProducts] = useState<ProductWithRelations[]>([]);

  // Filter states
  const [search, setSearch] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Pagination and sorting states
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Meta data from API
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Add selection column to columns
  const columnsWithSelection = useMemo<ColumnDef<ProductWithRelations>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ], [columns]);

  // Update selected products when row selection changes
  useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const newSelectedProducts = selectedRows.map(row => row.original);
    setSelectedProducts(newSelectedProducts);
    onSelectionChange?.(newSelectedProducts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, data]);

  // Fetch data function
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      });

      // Convert "all" → "" for API call
      if (search !== "all") params.append("search", search);
      if (selectedCategory !== "all")
        params.append("categoryId", selectedCategory);
      if (selectedBrand !== "all") params.append("brandId", selectedBrand);

      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result: ProductsResponse = await response.json();
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, sorting, debouncedSearch, selectedCategory, selectedBrand]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, selectedCategory, selectedBrand]);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    pageCount: meta.totalPages,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const handleClearFilters = () => {
    setSearch("all");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSorting([{ id: "createdAt", desc: true }]);
  };

  const handleClearSelection = () => {
    setRowSelection({});
    setSelectedProducts([]);
  };

  const handleRemoveFromSelection = (productId: string) => {
    setRowSelection(prev => {
      const newSelection = { ...prev };
      delete newSelection[productId];
      return newSelection;
    });
  };

  const handleBatchUpdateSuccess = () => {
    // Refresh the table data after successful batch update
    fetchProducts();
    // Clear selection after update
    handleClearSelection();
  };

  const hasActiveFilters =
    search !== "all" || selectedCategory !== "all" || selectedBrand !== "all";

  const selectedCount = selectedProducts.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Selected Products Display */}
      {selectedCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle>
                  Selected Products ({selectedCount})
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <BatchUpdateDialog
                  selectedProducts={selectedProducts}
                  onSuccess={handleBatchUpdateSuccess}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedProducts.map((product) => (
                <Badge
                  key={product.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="max-w-32 truncate">{product.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => handleRemoveFromSelection(product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter products by search, category, or brand
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description"
                className="pl-8"
                value={search === "all" ? "" : search}
                onChange={(e) => setSearch(e.target.value || "all")}
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                All Products
                {selectedCount > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {selectedCount} selected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {loading ? (
                  "Loading products..."
                ) : error ? (
                  <span className="text-destructive">{error}</span>
                ) : (
                  `Showing ${data.length} variants of ${meta.total} products`
                )}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
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
                    <TableCell
                      colSpan={columnsWithSelection.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={columnsWithSelection.length}
                      className="h-24 text-center text-destructive"
                    >
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow 
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={row.getIsSelected() ? "bg-blue-50 dark:bg-blue-950/20" : ""}
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
                      colSpan={columnsWithSelection.length}
                      className="h-24 text-center"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!error && meta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {Math.min((meta.page - 1) * meta.pageSize + 1, meta.total)} to{" "}
                  {Math.min(meta.page * meta.pageSize, meta.total)} of{" "}
                  {meta.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

//columns