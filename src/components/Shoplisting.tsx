// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

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
//         const res = await fetch("/api/category");
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
//     <div className="max-w-4xl mx-auto px-6 py-10">
//       <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>Categories</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-3">
//             {categories.map((cat) => (
//               <Button
//                 key={cat.id}
//                 variant="outline"
//                 asChild
//                 className="justify-start"
//               >
//                 {/* Navigate to your existing category product page */}
//                 <Link href={`/shop/category/${cat.id}`}>{cat.name}</Link>
//               </Button>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
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
    return <p className="text-center py-10">Loading categories...</p>;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/shop/category/${cat.id}`}
          className="px-4 py-2 border rounded-md hover:bg-black hover:text-white"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
