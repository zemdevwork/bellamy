import { CategoryDialogForm } from "@/components/category/category-dialog-form";
import CategoryTable from "@/components/category/category-table";
import { Category } from "@prisma/client";
import { categoryColumns } from "@/components/category/category-columns";

export default async function CategoriesPage() {
  // Fetch categories from your backend
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories: Category[] = await res.json();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground">Manage all categories</p>
            </div>
            <CategoryDialogForm />
          </div>

          {/* Categories Table */}
          <CategoryTable data={categories} columns={categoryColumns} />
        </div>
      </div>
    </div>
  );
}
