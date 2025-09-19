import { ProductFormDialog } from "@/components/product/product-dialog-form";
import ProductTable from "@/components/product/product-table";
import { productColumns } from "@/components/product/product-columns";

export default async function ProductPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const products = await res.json();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              
              <p className="text-muted-foreground">Manage Products</p>
            </div>
            <ProductFormDialog />
          </div>

          <ProductTable data={products} columns={productColumns} />
        </div>
      </div>
    </div>
  );
}
