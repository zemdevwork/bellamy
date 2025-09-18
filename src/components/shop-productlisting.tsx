"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type ProductAttribute = {
  name: string;
  value: string;
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
};

export default function ShopProductListing({ categoryId }: { categoryId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching products for categoryId:", categoryId); // Debug log
        
        const res = await fetch(`/api/product?categoryId=${categoryId}`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Fetched products:", data); // Debug log
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchProducts();
    }
  }, [categoryId]);

  if (loading) {
    return <p className="text-center py-10">Loading products...</p>;
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

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p>No products found for this category.</p>
        <Link href="/shop" className="mt-4 inline-block text-blue-500 hover:underline">
          Browse all categories
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <Link key={p.id} href={`/product/${p.id}`}>
          <ProductCard
            name={p.name}
            price={`₹${p.price.toFixed(2)}`}
            image={p.image}
          />
        </Link>
      ))}
    </div>
  );
}