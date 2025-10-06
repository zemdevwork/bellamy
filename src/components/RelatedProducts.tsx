"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

type ProductAttribute = { name: string; value: string };
type Brand = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  qty: number;
  image: string;
  isInCart?: boolean;
  isInWishlist?: boolean;
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

interface Props {
  brand: Brand;
  limit?: number;
  excludeProductId?: string;
}

export default function RelatedProducts({ brand, limit, excludeProductId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      if (!brand?.id) return;
      
      setLoading(true);
      setError(null);

      try {
        const productUrl = `/api/product?brandId=${encodeURIComponent(brand.id)}`;
        const response = await fetch(productUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const prodData = await response.json();
        
        if (mounted) {
          let filteredProducts = prodData;
          
          // Exclude current product if specified
          if (excludeProductId) {
            filteredProducts = filteredProducts.filter(
              (p: Product) => p.id !== excludeProductId
            );
          }
          
          // Limit number of products if specified
          if (limit) {
            filteredProducts = filteredProducts.slice(0, limit);
          }
          
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch products");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [brand?.id, limit, excludeProductId]);

  if (loading) {
    return (
      <div className="w-full text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading related products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-gray-600">No related products found from {brand.name}.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-10 sm:mt-20 md:mt-32">
            <h2 className="page-title">More from {brand.name}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
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
  );
}