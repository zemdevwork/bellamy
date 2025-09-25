"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ProductAttribute = {
  name: string;
  value: string;
};

type Brand = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  qty: number;
  image: string;
  subimage: string[];
  brandId?: string;
  categoryId?: string;
  subCategoryId?: string;
  createdAt: string;
  updatedAt: string;
  attributes: ProductAttribute[] | Record<string, unknown>;
  brand?: Brand;
};

export default function ShopProductListing({ categoryId }: { categoryId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId);
  const [sortOrder, setSortOrder] = useState<string>(""); // 🔹 sorting
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update selected category when categoryId prop changes
  useEffect(() => {
    setSelectedCategory(categoryId);
  }, [categoryId]);

  // Fetch categories on component mount
  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        const response = await fetch('/api/category', { cache: "no-store" });
        if (response.ok) {
          const categoryData = await response.json();
          if (mounted && Array.isArray(categoryData)) {
            setCategories(categoryData);
            if (!categoryId || categoryId == "") { setSelectedCategory(categoryData[0]?.id || "") }
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!selectedCategory) return;
      setLoading(true);
      setError(null);

      try {
        let productUrl = `/api/product?categoryId=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrand) productUrl += `&brandId=${encodeURIComponent(selectedBrand)}`;
        if (sortOrder) productUrl += `&sort=${encodeURIComponent(sortOrder)}`;

        const brandUrl = `/api/brand?categoryId=${encodeURIComponent(selectedCategory)}`;

        const [prodSettled, brandSettled] = await Promise.allSettled([
          fetch(productUrl, { cache: "no-store" }),
          fetch(brandUrl, { cache: "no-store" }),
        ]);

        if (prodSettled.status === "fulfilled") {
          if (!prodSettled.value.ok) {
            throw new Error(`Failed to fetch products: ${prodSettled.value.status}`);
          }
          const prodData = await prodSettled.value.json();
          if (mounted) setProducts(prodData);

          if (
            brandSettled.status !== "fulfilled" ||
            (brandSettled.value && !brandSettled.value.ok)
          ) {
            const map = new Map<string, Brand>();
            (prodData || []).forEach((p: Product) => {
              if (p.brand && p.brand.id) map.set(p.brand.id, p.brand);
              else if (p.brandId) map.set(p.brandId, { id: p.brandId, name: p.brandId });
            });
            if (mounted) setBrands(Array.from(map.values()));
          }
        } else {
          throw new Error("Network error while fetching products");
        }

        if (brandSettled.status === "fulfilled" && brandSettled.value.ok) {
          const brandData = await brandSettled.value.json();
          if (Array.isArray(brandData) && brandData.length > 0) {
            if (mounted) setBrands(brandData);
          }
        }
      } catch (err) {
        console.error("Error fetching products/brands:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products/brands");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, selectedBrand, sortOrder]);

  const handleCategoryChange = (newCategoryId: string) => {
    setSelectedCategory(newCategoryId);
    setSelectedBrand(""); // Reset brand filter when category changes
    // Update the URL without page refresh
    window.history.pushState({}, '', `/category/${newCategoryId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 🔹 Filters Row */}
      {/* 🔹 Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1 text-gray-600">Category</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-between">
                {categories.find((c) => c.id === selectedCategory)?.name || "Select Category"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Category</DropdownMenuLabel>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={selectedCategory === category.id ? "bg-gray-100" : ""}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Brand Filter */}
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1 text-gray-600">Brand</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-between">
                {selectedBrand
                  ? brands.find((b) => b.id === selectedBrand)?.name
                  : "All Brands"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Brand</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedBrand("")}>
                All Brands
              </DropdownMenuItem>
              {brands.map((brand) => (
                <DropdownMenuItem key={brand.id} onClick={() => setSelectedBrand(brand.id)}>
                  {brand.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1 text-gray-600">Sort</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-between">
                {sortOrder === "price_asc"
                  ? "Price: Low to High"
                  : sortOrder === "price_desc"
                    ? "Price: High to Low"
                    : "Newest"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortOrder("")}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-10">
          <p>No products found for this category.</p>
          <Link href="/shop" className="mt-4 inline-block text-blue-500 hover:underline">
            Browse all categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                id={product.id}
                name={product.name}
                price={`₹${product.price.toFixed(2)}`}
                image={product.image}
                description={product.description}
              />
              <Link
                href={`/product/${product.id}`}
                className="absolute inset-0 z-10 cursor-pointer"
                style={{ bottom: "120px" }}
              >
                <span className="sr-only">View {product.name} details</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}