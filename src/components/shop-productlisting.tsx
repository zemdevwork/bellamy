"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

type ProductAttribute = { name: string; value: string };
type Brand = { id: string; name: string };
type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; categoryId: string };

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
  defaultVariantId?: string | null;
};

type AttributeData = {
  colors: string[];
  sizes: string[];
};

export default function ShopProductListing({ 
  categoryId 
}: { 
  categoryId: string; 
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(categoryId);
  }, [categoryId]);

  useEffect(() => {
    let mounted = true;
    async function fetchCategories() {
      try {
        const response = await fetch("/api/category", { cache: "no-store" });
        if (response.ok) {
          const categoryData = await response.json();
          if (mounted && Array.isArray(categoryData))
            setCategories(categoryData);
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
    async function fetchAttributes() {
      try {
        const response = await fetch("/api/size-color", {
          cache: "no-store",
        });
        if (response.ok) {
          const data: AttributeData = await response.json();
          if (mounted) {
            setAvailableColors(data.colors || []);
            setAvailableSizes(data.sizes || []);
          }
        }
      } catch (err) {
        console.error("Error fetching attributes:", err);
      }
    }
    fetchAttributes();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchSubcategories() {
      try {
        if (!selectedCategory) {
          if (mounted) setSubcategories([]);
          return;
        }
        const response = await fetch(
          `/api/subcategory?categoryId=${encodeURIComponent(selectedCategory)}`,
          { cache: "no-store" }
        );
        if (response.ok) {
          const data = await response.json();
          if (mounted && Array.isArray(data)) setSubcategories(data);
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    }
    fetchSubcategories();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!selectedCategory) return;
      setLoading(true);
      setError(null);
      try {
        let productUrl = `/api/product?categoryId=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrand) productUrl += `&brandId=${encodeURIComponent(selectedBrand)}`;
        if (selectedSubCategory) productUrl += `&subCategoryId=${encodeURIComponent(selectedSubCategory)}`;
        if (sortOrder) productUrl += `&sort=${encodeURIComponent(sortOrder)}`;
        if (priceRange) productUrl += `&priceRange=${encodeURIComponent(priceRange)}`;
        if (selectedColor) productUrl += `&color=${encodeURIComponent(selectedColor)}`;
        if (selectedSize) productUrl += `&size=${encodeURIComponent(selectedSize)}`;

        const brandUrl = `/api/brand?categoryId=${encodeURIComponent(selectedCategory)}`;
        const [prodSettled, brandSettled] = await Promise.allSettled([
          fetch(productUrl, { cache: "no-store" }),
          fetch(brandUrl, { cache: "no-store" }),
        ]);

        if (prodSettled.status === "fulfilled") {
          if (!prodSettled.value.ok)
            throw new Error(`Failed to fetch products: ${prodSettled.value.status}`);
          const prodData = await prodSettled.value.json();
          if (mounted) setProducts(prodData);

          if (
            brandSettled.status !== "fulfilled" ||
            (brandSettled.value && !brandSettled.value.ok)
          ) {
            const map = new Map<string, Brand>();
            (prodData || []).forEach((p: Product) => {
              if (p.brand && p.brand.id) map.set(p.brand.id, p.brand);
              else if (p.brandId)
                map.set(p.brandId, { id: p.brandId, name: p.brandId });
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
        setError(
          err instanceof Error ? err.message : "Failed to fetch products/brands"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [
    selectedCategory,
    selectedBrand,
    sortOrder,
    selectedSubCategory,
    priceRange,
    selectedColor,
    selectedSize,
  ]);

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
    <div className="w-full h-full">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto px-4">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <h1 className="section-title">
            {categories.find((c) => c.id === selectedCategory)?.name || "Products"}
          </h1>
          <div className="lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700">
                FILTER BY
              </h3>
              <button
                onClick={() => {
                  setSelectedBrand("");
                  setSelectedSubCategory("");
                  setSortOrder("");
                  setPriceRange("");
                  setSelectedColor("");
                  setSelectedSize("");
                }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                Reset <span className="text-lg">⟲</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Price Range */}
              <div className="border-b border-gray-200 pb-4">
                <button className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  PRICE RANGE
                  <span className="text-gray-400">⌄</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs h-9"
                    >
                      {priceRange === ""
                        ? "All Prices"
                        : priceRange === "1-500"
                        ? "₹1 - ₹500"
                        : priceRange === "500-1000"
                        ? "₹500 - ₹1,000"
                        : priceRange === "1000-5000"
                        ? "₹1,000 - ₹5,000"
                        : "₹5,000+"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    <DropdownMenuLabel>Select Price Range</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setPriceRange("")}>
                      All Prices
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriceRange("1-500")}>
                      ₹1 - ₹500
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriceRange("500-1000")}>
                      ₹500 - ₹1,000
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setPriceRange("1000-5000")}
                    >
                      ₹1,000 - ₹5,000
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriceRange("5000+")}>
                      ₹5,000+
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Subcategory */}
              <div className="border-b border-gray-200 pb-4">
                <button className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  SUBCATEGORY
                  <span className="text-gray-400">⌄</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs h-9"
                    >
                      {selectedSubCategory === ""
                        ? "All Subcategories"
                        : subcategories.find(
                            (s) => s.id === selectedSubCategory
                          )?.name || "Select"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    <DropdownMenuLabel>Select Subcategory</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setSelectedSubCategory("")}
                    >
                      All Subcategories
                    </DropdownMenuItem>
                    {subcategories.map((sub) => (
                      <DropdownMenuItem
                        key={sub.id}
                        onClick={() => setSelectedSubCategory(sub.id)}
                      >
                        {sub.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Size */}
              <div className="border-b border-gray-200 pb-4">
                <button className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  SIZE
                  <span className="text-gray-400">⌄</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs h-9"
                    >
                      {selectedSize || "All Sizes"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    <DropdownMenuLabel>Select Size</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedSize("")}>
                      All Sizes
                    </DropdownMenuItem>
                    {availableSizes.map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Colour */}
              <div className="border-b border-gray-200 pb-4">
                <button className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  COLOUR
                  <span className="text-gray-400">⌄</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs h-9"
                    >
                      {selectedColor || "All Colors"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    <DropdownMenuLabel>Select Color</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedColor("")}>
                      All Colors
                    </DropdownMenuItem>
                    {availableColors.map((color) => (
                      <DropdownMenuItem
                        key={color}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Brand */}
              <div className="border-b border-gray-200 pb-4">
                <button className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                  BRAND
                  <span className="text-gray-400">⌄</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs h-9"
                    >
                      {selectedBrand
                        ? brands.find((b) => b.id === selectedBrand)?.name
                        : "All Brands"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[240px]">
                    <DropdownMenuLabel>Select Brand</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedBrand("")}>
                      All Brands
                    </DropdownMenuItem>
                    {brands.map((brand) => (
                      <DropdownMenuItem
                        key={brand.id}
                        onClick={() => setSelectedBrand(brand.id)}
                      >
                        {brand.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{products.length}</span> Products
              Found
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs sm:text-sm text-gray-700 font-medium uppercase tracking-wide">
                SORT BY :
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 sm:min-w-[160px] h-9 text-xs justify-between"
                  >
                    {sortOrder === "price_asc"
                      ? "Price: Low to High"
                      : sortOrder === "price_desc"
                      ? "Price: High to Low"
                      : "New Arrivals"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortOrder("")}>
                    New Arrivals
                  </DropdownMenuItem>
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

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">
                No products found for this category.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-gray-700 hover:underline"
              >
                Browse all categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <div key={p.id} className="group">
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    price={`${p.price.toFixed(2)}`}
                    image={p.image}
                    description={p.description}
                    variantId={p.defaultVariantId as string}
                    brandName={p.brand?.name}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}