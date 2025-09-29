// "use client";

// import { useEffect, useState } from "react";
// import ProductCard from "@/components/ProductCard";
// import Link from "next/link";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";

// type ProductAttribute = {
//   name: string;
//   value: string;
// };

// type Brand = {
//   id: string;
//   name: string;
// };

// type Category = {
//   id: string;
//   name: string;
// };

// type SubCategory = {
//   id: string;
//   name: string;
//   categoryId: string;
// };

// type Product = {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   qty: number;
//   image: string;
//   subimage: string[];
//   brandId?: string;
//   categoryId?: string;
//   subCategoryId?: string;
//   createdAt: string;
//   updatedAt: string;
//   attributes: ProductAttribute[] | Record<string, unknown>;
//   brand?: Brand;
//   defaultVariantId?: string | null;
// };

// export default function ShopProductListing({ categoryId, hideCategoryFilter }: { categoryId: string, hideCategoryFilter?: boolean }) {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [brands, setBrands] = useState<Brand[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
//   const [selectedBrand, setSelectedBrand] = useState<string>("");
//   const [selectedCategory, setSelectedCategory] = useState<string>(categoryId);
//   const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
//   const [sortOrder, setSortOrder] = useState<string>(""); // 🔹 sorting
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Update selected category when categoryId prop changes
//   useEffect(() => {
//     setSelectedCategory(categoryId);
//   }, [categoryId]);

//   // Fetch categories on component mount
//   useEffect(() => {
//     let mounted = true;

//     async function fetchCategories() {
//       try {
//         const response = await fetch('/api/category', { cache: "no-store" });
//         if (response.ok) {
//           const categoryData = await response.json();
//           if (mounted && Array.isArray(categoryData)) {
//             setCategories(categoryData);
//             if (!categoryId || categoryId == "") { setSelectedCategory(categoryData[0]?.id || "") }
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//       }
//     }

//     fetchCategories();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Fetch subcategories when category changes
//   useEffect(() => {
//     let mounted = true;
//     async function fetchSubcategories() {
//       try {
//         if (!selectedCategory) {
//           if (mounted) setSubcategories([]);
//           return;
//         }
//         const response = await fetch(`/api/subcategory?categoryId=${encodeURIComponent(selectedCategory)}`, { cache: "no-store" });
//         if (response.ok) {
//           const data = await response.json();
//           if (mounted && Array.isArray(data)) setSubcategories(data);
//         }
//       } catch (err) {
//         console.error("Error fetching subcategories:", err);
//       }
//     }
//     fetchSubcategories();
//     return () => { mounted = false; };
//   }, [selectedCategory]);

//   useEffect(() => {
//     let mounted = true;

//     async function fetchData() {
//       if (!selectedCategory) return;
//       setLoading(true);
//       setError(null);

//       try {
//         let productUrl = `/api/product?categoryId=${encodeURIComponent(selectedCategory)}`;
//         if (selectedBrand) productUrl += `&brandId=${encodeURIComponent(selectedBrand)}`;
//         if (selectedSubCategory) productUrl += `&subCategoryId=${encodeURIComponent(selectedSubCategory)}`;
//         if (sortOrder) productUrl += `&sort=${encodeURIComponent(sortOrder)}`;

//         const brandUrl = `/api/brand?categoryId=${encodeURIComponent(selectedCategory)}`;

//         const [prodSettled, brandSettled] = await Promise.allSettled([
//           fetch(productUrl, { cache: "no-store" }),
//           fetch(brandUrl, { cache: "no-store" }),
//         ]);

//         if (prodSettled.status === "fulfilled") {
//           if (!prodSettled.value.ok) {
//             throw new Error(`Failed to fetch products: ${prodSettled.value.status}`);
//           }
//           const prodData = await prodSettled.value.json();
//           if (mounted) setProducts(prodData);

//           if (
//             brandSettled.status !== "fulfilled" ||
//             (brandSettled.value && !brandSettled.value.ok)
//           ) {
//             const map = new Map<string, Brand>();
//             (prodData || []).forEach((p: Product) => {
//               if (p.brand && p.brand.id) map.set(p.brand.id, p.brand);
//               else if (p.brandId) map.set(p.brandId, { id: p.brandId, name: p.brandId });
//             });
//             if (mounted) setBrands(Array.from(map.values()));
//           }
//         } else {
//           throw new Error("Network error while fetching products");
//         }

//         if (brandSettled.status === "fulfilled" && brandSettled.value.ok) {
//           const brandData = await brandSettled.value.json();
//           if (Array.isArray(brandData) && brandData.length > 0) {
//             if (mounted) setBrands(brandData);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching products/brands:", err);
//         setError(err instanceof Error ? err.message : "Failed to fetch products/brands");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     fetchData();
//     return () => {
//       mounted = false;
//     };
//   }, [selectedCategory, selectedBrand, sortOrder, selectedSubCategory]);

//   const handleCategoryChange = (newCategoryId: string) => {
//     setSelectedCategory(newCategoryId);
//     setSelectedBrand(""); // Reset brand filter when category changes
//     setSelectedSubCategory("");
//     // Update the URL without page refresh
//     window.history.pushState({}, '', `/category/${newCategoryId}`);
//   };

//   if (loading) {
//     return (
//       <div className="text-center py-10">
//         <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//         <p className="mt-2">Loading products...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-10">
//         <p className="text-red-600">Error: {error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* 🔹 Filters Row */}
//       <div className="flex flex-wrap items-center gap-4 mb-6">
//         {/* Category Filter */}
//         {!hideCategoryFilter && (
//           <div className="flex flex-col">
//             <span className="text-sm font-medium mb-1 text-gray-600">Category</span>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="min-w-[150px] justify-between">
//                   {categories.find((c) => c.id === selectedCategory)?.name || "Select Category"}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuLabel>Select Category</DropdownMenuLabel>
//                 {categories.map((category) => (
//                   <DropdownMenuItem
//                     key={category.id}
//                     onClick={() => handleCategoryChange(category.id)}
//                     className={selectedCategory === category.id ? "bg-gray-100" : ""}
//                   >
//                     {category.name}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         )}

//         {/* Brand Filter */}
//         <div className="flex flex-col">
//           <span className="text-sm font-medium mb-1 text-gray-600">Brand</span>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="min-w-[150px] justify-between">
//                 {selectedBrand
//                   ? brands.find((b) => b.id === selectedBrand)?.name
//                   : "All Brands"}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Select Brand</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => setSelectedBrand("")}>
//                 All Brands
//               </DropdownMenuItem>
//               {brands.map((brand) => (
//                 <DropdownMenuItem key={brand.id} onClick={() => setSelectedBrand(brand.id)}>
//                   {brand.name}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         {/* Subcategory Filter */}
//         {selectedCategory && (
//           <div className="flex flex-col">
//             <span className="text-sm font-medium mb-1 text-gray-600">Subcategory</span>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="min-w-[180px] justify-between">
//                   {selectedSubCategory === ""
//                     ? "All Subcategories"
//                     : subcategories.find((s) => s.id === selectedSubCategory)?.name || "Select Subcategory"}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuLabel>Select Subcategory</DropdownMenuLabel>
//                 <DropdownMenuItem onClick={() => setSelectedSubCategory("")}>All Subcategories</DropdownMenuItem>
//                 {subcategories.map((sub) => (
//                   <DropdownMenuItem key={sub.id} onClick={() => setSelectedSubCategory(sub.id)}>
//                     {sub.name}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         )}

//         {/* Sort Filter */}
//         <div className="flex flex-col">
//           <span className="text-sm font-medium mb-1 text-gray-600">Sort</span>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="min-w-[150px] justify-between">
//                 {sortOrder === "price_asc"
//                   ? "Price: Low to High"
//                   : sortOrder === "price_desc"
//                     ? "Price: High to Low"
//                     : "Newest"}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuLabel>Sort by</DropdownMenuLabel>
//               <DropdownMenuItem onClick={() => setSortOrder("")}>Newest</DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>
//                 Price: Low to High
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>
//                 Price: High to Low
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>


//       {/* Product Grid */}
//       {products.length === 0 ? (
//         <div className="text-center py-10">
//           <p>No products found for this category.</p>
//           <Link href="/shop" className="mt-4 inline-block text-blue-500 hover:underline">
//             Browse all categories
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <div key={product.id} className="relative group">
//               <ProductCard
//                 id={product.id}
//                 name={product.name}
//                 price={`₹${product.price.toFixed(2)}`}
//                 image={product.image}
//                 description={product.description}
//                 variantId={product.defaultVariantId as string}
//               />
//               <Link
//                 href={`/product/${product.id}`}
//                 className="absolute inset-0 z-10 cursor-pointer"
//                 style={{ bottom: "120px" }}
//               >
//                 <span className="sr-only">View {product.name} details</span>
//               </Link>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
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

export default function ShopProductListing({ categoryId, hideCategoryFilter }: { categoryId: string; hideCategoryFilter?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setSelectedCategory(categoryId); }, [categoryId]);

  useEffect(() => {
    let mounted = true;
    async function fetchCategories() {
      try {
        const response = await fetch('/api/category', { cache: "no-store" });
        if (response.ok) {
          const categoryData = await response.json();
          if (mounted && Array.isArray(categoryData)) {
            setCategories(categoryData);
            if (!categoryId || categoryId === "") setSelectedCategory(categoryData[0]?.id || "");
          }
        }
      } catch (err) { console.error("Error fetching categories:", err); }
    }
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchSubcategories() {
      try {
        if (!selectedCategory) { if (mounted) setSubcategories([]); return; }
        const response = await fetch(`/api/subcategory?categoryId=${encodeURIComponent(selectedCategory)}`, { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (mounted && Array.isArray(data)) setSubcategories(data);
        }
      } catch (err) { console.error("Error fetching subcategories:", err); }
    }
    fetchSubcategories();
    return () => { mounted = false; };
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!selectedCategory) return;
      setLoading(true); setError(null);
      try {
        let productUrl = `/api/product?categoryId=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrand) productUrl += `&brandId=${encodeURIComponent(selectedBrand)}`;
        if (selectedSubCategory) productUrl += `&subCategoryId=${encodeURIComponent(selectedSubCategory)}`;
        if (sortOrder) productUrl += `&sort=${encodeURIComponent(sortOrder)}`;
        const brandUrl = `/api/brand?categoryId=${encodeURIComponent(selectedCategory)}`;
        const [prodSettled, brandSettled] = await Promise.allSettled([
          fetch(productUrl, { cache: "no-store" }),
          fetch(brandUrl, { cache: "no-store" }),
        ]);
        if (prodSettled.status === "fulfilled") {
          if (!prodSettled.value.ok) throw new Error(`Failed to fetch products: ${prodSettled.value.status}`);
          const prodData = await prodSettled.value.json();
          if (mounted) setProducts(prodData);
          if (brandSettled.status !== "fulfilled" || (brandSettled.value && !brandSettled.value.ok)) {
            const map = new Map<string, Brand>();
            (prodData || []).forEach((p: Product) => {
              if (p.brand && p.brand.id) map.set(p.brand.id, p.brand);
              else if (p.brandId) map.set(p.brandId, { id: p.brandId, name: p.brandId });
            });
            if (mounted) setBrands(Array.from(map.values()));
          }
        } else { throw new Error("Network error while fetching products"); }
        if (brandSettled.status === "fulfilled" && brandSettled.value.ok) {
          const brandData = await brandSettled.value.json();
          if (Array.isArray(brandData) && brandData.length > 0) { if (mounted) setBrands(brandData); }
        }
      } catch (err) {
        console.error("Error fetching products/brands:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products/brands");
      } finally { if (mounted) setLoading(false); }
    }
    fetchData();
    return () => { mounted = false; };
  }, [selectedCategory, selectedBrand, sortOrder, selectedSubCategory]);

  const handleCategoryChange = (newCategoryId: string) => {
    setSelectedCategory(newCategoryId);
    setSelectedBrand("");
    setSelectedSubCategory("");
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
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Try Again</button>
      </div>
    );
  }

  const brand = { primary: "#8B1D3F", bgSoft: "#F7ECEF" };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border" style={{ borderColor: "#E9D8DD", backgroundColor: "#fff" }}>
            <div className="p-4 border-b" style={{ borderColor: "#F0E5E9" }}>
              <h3 className="font-serif text-lg" style={{ color: brand.primary }}>Filter By</h3>
            </div>
            <div className="p-4 space-y-6">
              {!hideCategoryFilter && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Category</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">{categories.find((c) => c.id === selectedCategory)?.name || "Select Category"}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[220px]">
                      <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                      {categories.map((category) => (
                        <DropdownMenuItem key={category.id} onClick={() => handleCategoryChange(category.id)} className={selectedCategory === category.id ? "bg-gray-100" : ""}>{category.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Brand</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">{selectedBrand ? brands.find((b) => b.id === selectedBrand)?.name : "All Brands"}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[220px]">
                    <DropdownMenuLabel>Select Brand</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelectedBrand("")}>All Brands</DropdownMenuItem>
                    {brands.map((brand) => (
                      <DropdownMenuItem key={brand.id} onClick={() => setSelectedBrand(brand.id)}>{brand.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {selectedCategory && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Subcategory</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">{selectedSubCategory === "" ? "All Subcategories" : subcategories.find((s) => s.id === selectedSubCategory)?.name || "Select Subcategory"}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[240px]">
                      <DropdownMenuLabel>Select Subcategory</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedSubCategory("")}>All Subcategories</DropdownMenuItem>
                      {subcategories.map((sub) => (
                        <DropdownMenuItem key={sub.id} onClick={() => setSelectedSubCategory(sub.id)}>{sub.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 md:col-span-9">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl" style={{ color: brand.primary }}>{products.length} Products Found</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[180px] justify-between">{sortOrder === "price_asc" ? "Price: Low to High" : sortOrder === "price_desc" ? "Price: High to Low" : "Newest"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortOrder("")}>Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>Price: High to Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-10">
              <p>No products found for this category.</p>
              <Link href="/shop" className="mt-4 inline-block text-blue-500 hover:underline">Browse all categories</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group">
                  <div className="rounded-xl overflow-hidden border bg-white" style={{ borderColor: "#E9D8DD" }}>
                    <div className="aspect-[3/4] overflow-hidden bg-[#F9F6F7]">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">{p.brand?.name || " "}</div>
                      <h3 className="font-serif text-base text-gray-900 line-clamp-2">{p.name}</h3>
                      <div className="mt-2 font-semibold" style={{ color: brand.primary }}>₹{p.price.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


