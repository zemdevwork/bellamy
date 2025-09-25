'use client';

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ApiResponse {
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ProductTableProps {
  columns: ColumnDef<Product>[];
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductTable({ columns }: ProductTableProps) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [sortBy, setSortBy] = useState("created_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state from API
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (selectedSubCategoryId) params.set("subCategoryId", selectedSubCategoryId);
    if (selectedBrandId) params.set("brandId", selectedBrandId);
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (sortBy) params.set("sort", sortBy);
    
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    
    return params.toString();
  }, [selectedCategoryId, selectedSubCategoryId, selectedBrandId, debouncedSearchTerm, sortBy, currentPage, pageSize]);

  // Fetch filter data (categories, brands, subcategories)
  const fetchFilterData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes, subCategoriesRes] = await Promise.all([
        fetch('/api/category'),
        fetch('/api/brand'),
        fetch('/api/subcategory')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log("categoriesData", categoriesData);
        // Fix: Access the data directly since your API returns arrays directly
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.data || []);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        console.log("brandsData", brandsData);
        // Fix: Access the data directly since your API returns arrays directly
        setBrands(Array.isArray(brandsData) ? brandsData : brandsData.data || []);
      }

      if (subCategoriesRes.ok) {
        const subCategoriesData = await subCategoriesRes.json();
        console.log("subCategoriesData", subCategoriesData,Array.isArray(subCategoriesData));
        // Fix: Access the data directly since your API returns arrays directly
      }
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/product?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const result: ApiResponse = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Initial data fetch
  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategoryId, selectedSubCategoryId, selectedBrandId, sortBy]);

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId]);

  // Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination.totalPages,
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value === "all" ? "" : value);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrandId(value === "all" ? "" : value);
  };

  const clearFilters = () => {
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setSelectedBrandId("");
    setSearchTerm("");
    setSortBy("created_desc");
  };

  const hasActiveFilters = selectedCategoryId || selectedSubCategoryId || selectedBrandId || searchTerm;

  const sortOptions = [
    { value: "created_desc", label: "Newest First" },
    { value: "created_asc", label: "Oldest First" },
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
    { value: "price_asc", label: "Price Low to High" },
    { value: "price_desc", label: "Price High to Low" },
    { value: "stock_asc", label: "Stock Low to High" },
    { value: "stock_desc", label: "Stock High to Low" },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading products: {error}
            <Button 
              onClick={fetchProducts} 
              className="ml-2"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filters Toggle */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Search & Filters</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[selectedCategoryId, selectedBrandId, searchTerm].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
            <CardDescription>Search and filter products</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category ({categories.length} available)</label>
                  <Select value={selectedCategoryId || "all"} onValueChange={handleCategoryChange}>
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
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand ({brands.length} available)</label>
                  <Select value={selectedBrandId || "all"} onValueChange={handleBrandChange}>
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

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {
              `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, pagination.totalCount)} of ${pagination.totalCount} products`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
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
                      {loading ? "Loading..." : "No products found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}