"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { ChevronDown, ChevronUp, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { brand } from "@/constants/values";

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
  isInCart?: boolean;
  isInWishlist?: boolean;
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
  
  // Mobile UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [mobileFilterView, setMobileFilterView] = useState<string | null>(null);
  
  // Desktop accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    subcategory: false,
    size: false,
    color: false,
    brand: false,
    sort: false,
  });

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

  const resetFilters = () => {
    setSelectedBrand("");
    setSelectedSubCategory("");
    setSortOrder("");
    setPriceRange("");
    setSelectedColor("");
    setSelectedSize("");
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: string; 
    children: React.ReactNode;
  }) => (
    <div className="border-b pb-2 border-gray-200">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wide hover:text-gray-900"
      >
        {title}
        {openSections[section] ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all ease-in duration-200 ${
          openSections[section] ? "max-h-96 pb-4" : "max-h-0"
        }`}
      >
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );

  const FilterOption = ({ 
    label, 
    isSelected, 
    onClick 
  }: { 
    label: string; 
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
        isSelected
          ? "text-white"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      }`}
      style={isSelected ? { backgroundColor: brand.primary } : {}}
    >
      {label}
    </button>
  );

  const SortOption = ({ 
    label,
    isSelected, 
    onClick 
  }: { 
    label: string; 
    value: string;
    isSelected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 transition-colors ${
        isSelected
          ? "text-white"
          : "text-gray-700 hover:bg-gray-50"
      }`}
      style={isSelected ? { backgroundColor: brand.primary } : {}}
    >
      {label}
    </button>
  );

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
    <div className="w-full h-full pb-20 lg:pb-0">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        {/* Filter Header and Sort Section - Full Width */}
        <div className="flex-col hidden lg:flex lg:flex-row items-start lg:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
          {/* Filter By Header (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-between w-64 flex-shrink-0">
            <h3 className="text-base sm:text-md md:text-lg font-medium uppercase tracking-wider text-gray-700">
              FILTER BY
            </h3>
            <button
              onClick={resetFilters}
              className="text-base text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Reset <span className="text-xl">⟲</span>
            </button>
          </div>

          {/* Sort Section */}
          <div className="hidden lg:flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs sm:text-sm text-gray-700 font-medium uppercase tracking-wide">
              SORT BY :
            </span>
            <div className="relative">
              <button
                onClick={() => setOpenSections(prev => ({ ...prev, sort: !prev.sort }))}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 min-w-[160px] justify-between"
              >
                {sortOrder === "price_asc"
                  ? "Price: Low to High"
                  : sortOrder === "price_desc"
                  ? "Price: High to Low"
                  : "Newly Arrived"}
                {openSections.sort ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {openSections.sort && (
                <div className="absolute right-0 top-full mt-1 w-[180px] bg-white border border-gray-200 rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      setSortOrder("");
                      setOpenSections(prev => ({ ...prev, sort: false }));
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOrder === "" ? "font-medium" : ""
                    }`}
                    style={sortOrder === "" ? { color: brand.primary } : {}}
                  >
                    Newly Arrived
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("price_asc");
                      setOpenSections(prev => ({ ...prev, sort: false }));
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOrder === "price_asc" ? "font-medium" : ""
                    }`}
                    style={sortOrder === "price_asc" ? { color: brand.primary } : {}}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("price_desc");
                      setOpenSections(prev => ({ ...prev, sort: false }));
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOrder === "price_desc" ? "font-medium" : ""
                    }`}
                    style={sortOrder === "price_desc" ? { color: brand.primary } : {}}
                  >
                    Price: High to Low
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Products Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div>
              <div className="space-y-3">
                <FilterSection title="PRICE RANGE" section="price">
                  <FilterOption
                    label="All Prices"
                    isSelected={priceRange === ""}
                    onClick={() => setPriceRange("")}
                  />
                  <FilterOption
                    label="₹1 - ₹500"
                    isSelected={priceRange === "1-500"}
                    onClick={() => setPriceRange("1-500")}
                  />
                  <FilterOption
                    label="₹500 - ₹1,000"
                    isSelected={priceRange === "500-1000"}
                    onClick={() => setPriceRange("500-1000")}
                  />
                  <FilterOption
                    label="₹1,000 - ₹5,000"
                    isSelected={priceRange === "1000-5000"}
                    onClick={() => setPriceRange("1000-5000")}
                  />
                  <FilterOption
                    label="₹5,000+"
                    isSelected={priceRange === "5000+"}
                    onClick={() => setPriceRange("5000+")}
                  />
                </FilterSection>

                <FilterSection title="SUBCATEGORY" section="subcategory">
                  <FilterOption
                    label="All Subcategories"
                    isSelected={selectedSubCategory === ""}
                    onClick={() => setSelectedSubCategory("")}
                  />
                  {subcategories.map((sub) => (
                    <FilterOption
                      key={sub.id}
                      label={sub.name}
                      isSelected={selectedSubCategory === sub.id}
                      onClick={() => setSelectedSubCategory(sub.id)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="SIZE" section="size">
                  <FilterOption
                    label="All Sizes"
                    isSelected={selectedSize === ""}
                    onClick={() => setSelectedSize("")}
                  />
                  {availableSizes.map((size) => (
                    <FilterOption
                      key={size}
                      label={size}
                      isSelected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="COLOUR" section="color">
                  <FilterOption
                    label="All Colors"
                    isSelected={selectedColor === ""}
                    onClick={() => setSelectedColor("")}
                  />
                  {availableColors.map((color) => (
                    <FilterOption
                      key={color}
                      label={color}
                      isSelected={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="BRAND" section="brand">
                  <FilterOption
                    label="All Brands"
                    isSelected={selectedBrand === ""}
                    onClick={() => setSelectedBrand("")}
                  />
                  {brands.map((brand) => (
                    <FilterOption
                      key={brand.id}
                      label={brand.name}
                      isSelected={selectedBrand === brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                    />
                  ))}
                </FilterSection>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex items-center justify-between pb-4">
                  <h1 className="section-title">
                    {categories.find((c) => c.id === selectedCategory)?.name || "Products"}
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{products.length}</span>{" "}
                    Products Found
                  </div>
                </div>

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
              <div className="w-full">
                <div className="flex items-start justify-between">
                  <h1 className="product-title">
                    {categories.find((c) => c.id === selectedCategory)?.name || "Products"}
                  </h1>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{products.length}</span>{" "}
                    Products Found
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto h-screen scrollbar-hide">
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
                        isInCart={p.isInCart}
                        isInWishlist={p.isInWishlist}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <button
            onClick={() => setShowMobileSort(true)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowUpDown className="h-4 w-4" />
            SORT
          </button>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            FILTER
          </button>
        </div>
      </div>

      {/* Mobile Sort Modal */}
      {showMobileSort && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setShowMobileSort(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-out"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button onClick={() => setShowMobileSort(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              <SortOption
                label="Newly Arrived"
                value=""
                isSelected={sortOrder === ""}
                onClick={() => {
                  setSortOrder("");
                  setShowMobileSort(false);
                }}
              />
              <SortOption
                label="Price: Low to High"
                value="price_asc"
                isSelected={sortOrder === "price_asc"}
                onClick={() => {
                  setSortOrder("price_asc");
                  setShowMobileSort(false);
                }}
              />
              <SortOption
                label="Price: High to Low"
                value="price_desc"
                isSelected={sortOrder === "price_desc"}
                onClick={() => {
                  setSortOrder("price_desc");
                  setShowMobileSort(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col transform transition-transform duration-300 ease-out"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset
              </button>
              <button onClick={() => {
                setShowMobileFilters(false);
                setMobileFilterView(null);
              }}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Left Column - Filter Categories */}
            <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
              <button
                onClick={() => setMobileFilterView("price")}
                className={`w-full text-left px-4 py-4 text-sm border-b border-gray-100 ${
                  mobileFilterView === "price" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Price Range
              </button>
              <button
                onClick={() => setMobileFilterView("subcategory")}
                className={`w-full text-left px-4 py-4 text-sm border-b border-gray-100 ${
                  mobileFilterView === "subcategory" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Subcategory
              </button>
              <button
                onClick={() => setMobileFilterView("size")}
                className={`w-full text-left px-4 py-4 text-sm border-b border-gray-100 ${
                  mobileFilterView === "size" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Size
              </button>
              <button
                onClick={() => setMobileFilterView("color")}
                className={`w-full text-left px-4 py-4 text-sm border-b border-gray-100 ${
                  mobileFilterView === "color" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Colour
              </button>
              <button
                onClick={() => setMobileFilterView("brand")}
                className={`w-full text-left px-4 py-4 text-sm border-b border-gray-100 ${
                  mobileFilterView === "brand" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Brand
              </button>
            </div>

            {/* Right Column - Filter Options */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {mobileFilterView === "price" && (
                <div className="p-4 space-y-2">
                  <FilterOption
                    label="All Prices"
                    isSelected={priceRange === ""}
                    onClick={() => setPriceRange("")}
                  />
                  <FilterOption
                    label="₹1 - ₹500"
                    isSelected={priceRange === "1-500"}
                    onClick={() => setPriceRange("1-500")}
                  />
                  <FilterOption
                    label="₹500 - ₹1,000"
                    isSelected={priceRange === "500-1000"}
                    onClick={() => setPriceRange("500-1000")}
                  />
                  <FilterOption
                    label="₹1,000 - ₹5,000"
                    isSelected={priceRange === "1000-5000"}
                    onClick={() => setPriceRange("1000-5000")}
                  />
                  <FilterOption
                    label="₹5,000+"
                    isSelected={priceRange === "5000+"}
                    onClick={() => setPriceRange("5000+")}
                  />
                </div>
              )}

              {mobileFilterView === "subcategory" && (
                <div className="p-4 space-y-2">
                  <FilterOption
                    label="All Subcategories"
                    isSelected={selectedSubCategory === ""}
                    onClick={() => setSelectedSubCategory("")}
                  />
                  {subcategories.map((sub) => (
                    <FilterOption
                      key={sub.id}
                      label={sub.name}
                      isSelected={selectedSubCategory === sub.id}
                      onClick={() => setSelectedSubCategory(sub.id)}
                    />
                  ))}
                </div>
              )}

              {mobileFilterView === "size" && (
                <div className="p-4 space-y-2">
                  <FilterOption
                    label="All Sizes"
                    isSelected={selectedSize === ""}
                    onClick={() => setSelectedSize("")}
                  />
                  {availableSizes.map((size) => (
                    <FilterOption
                      key={size}
                      label={size}
                      isSelected={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    />
                  ))}
                </div>
              )}

              {mobileFilterView === "color" && (
                <div className="p-4 space-y-2">
                  <FilterOption
                    label="All Colors"
                    isSelected={selectedColor === ""}
                    onClick={() => setSelectedColor("")}
                  />
                  {availableColors.map((color) => (
                    <FilterOption
                      key={color}
                      label={color}
                      isSelected={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              )}

              {mobileFilterView === "brand" && (
                <div className="p-4 space-y-2">
                  <FilterOption
                    label="All Brands"
                    isSelected={selectedBrand === ""}
                    onClick={() => setSelectedBrand("")}
                  />
                  {brands.map((brand) => (
                    <FilterOption
                      key={brand.id}
                      label={brand.name}
                      isSelected={selectedBrand === brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                    />
                  ))}
                </div>
              )}

              {!mobileFilterView && (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Select a filter category
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <Button
              onClick={() => {
                setShowMobileFilters(false);
                setMobileFilterView(null);
              }}
              className="w-full text-white"
              style={{ backgroundColor: brand.primary }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}