// "use client";

// import { useEffect, useState } from "react";
// import ProductCard from "@/components/ProductCard";

// // Type should match your Prisma model structure
// type Product = {
//   id: string;
//   name: string;
//   price: number;
//   oldPrice?: number | null;
//   image: string;
//   rating?: number | null;
//   description?: string | null;
//   qty: number;
//   attributes?: any[];
//   // Include related data from your Prisma query
//   category?: {
//     id: string;
//     name: string;
//   } | null;
//   brand?: {
//     id: string;
//     name: string;
//   } | null;
//   subCategory?: {
//     id: string;
//     name: string;
//   } | null;
// };

// export default function ProductList() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         console.log("Fetching products from /api/product...");
        
//         const res = await fetch("/api/product", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
        
//         console.log("Response status:", res.status);
//         console.log("Response URL:", res.url);
        
//         if (!res.ok) {
//           const errorText = await res.text();
//           console.error("Error response:", errorText);
//           throw new Error(`HTTP ${res.status}: ${errorText}`);
//         }
        
//         const data = await res.json();
//         console.log("Fetched products:", data);
        
//         if (data.error) {
//           throw new Error(data.error);
//         }
        
//         setProducts(data);
//         setError(null);
//       } catch (error) {
//         console.error("Failed to load products:", error);
//         setError(error instanceof Error ? error.message : 'Failed to load products');
//       } finally {
//         setLoading(false);
//       }
//     }
    
//     fetchProducts();
//   }, []);

//   if (loading) {
//     return (
//       <div className="text-center py-8">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//         <p className="mt-4 text-gray-600">Loading products...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-8">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//           <p className="text-red-800 mb-4">Error: {error}</p>
//           <button 
//             onClick={() => {
//               setError(null);
//               setLoading(true);
//               window.location.reload();
//             }}
//             className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (products.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-600">No products found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//       {products.map((product) => (
//         <ProductCard
//           key={product.id}
//           name={product.name}
//           price={`₹${product.price.toFixed(2)}`}
//           oldPrice={product.oldPrice ? `₹${product.oldPrice.toFixed(2)}` : undefined}
//           image={product.image}
//           rating={product.rating || 0}
//         />
//       ))}
//     </div>
//   );
// }