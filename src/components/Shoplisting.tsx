
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// type Category = {
//   id: string;
//   name: string;
// };

// export default function ShopListing() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const res = await fetch("/api/category", { cache: "no-store" });
//         if (!res.ok) throw new Error("Failed to fetch categories");
//         const data = await res.json();
//         setCategories(data);
//       } catch (error) {
//         console.error("Failed to load categories", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchCategories();
//   }, []);

//   if (loading) {
//     return <p className="text-center py-10">Loading categories...</p>;
//   }

//   return (
//     <div className="flex flex-wrap gap-3 mb-6">
//       {categories.map((cat) => (
//         <Link
//           key={cat.id}
//           href={`/shop/category/${cat.id}`}
//           className="px-4 py-2 border rounded-md hover:bg-black hover:text-white"
//         >
//           {cat.name}
//         </Link>
//       ))}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
};

export default function ShopListing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return  <div className="text-center py-10">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    <p className="mt-2">Loading Categories...</p>
      </div>;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/shop/category/${cat.id}`}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-black hover:text-white transition-colors"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
