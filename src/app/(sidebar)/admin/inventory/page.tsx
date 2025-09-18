import { inventoryColumns } from "@/components/inventory/inventory-column";
import InvenotryTable from "@/components/inventory/inventory-table";
import React from "react";
import { Brand , Category } from "@prisma/client";

export default async function InvenotryPage() {

  const brands : Brand[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand`, { cache: "no-store" }).then((res) => res.json());
  const categories : Category[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`, { cache: "no-store" }).then((res) => res.json());

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Invenotry</h1>
              <p className="text-muted-foreground">Manage Invenotry</p>
            </div>
          </div>

          <InvenotryTable brands={brands} categories={categories} columns={inventoryColumns} />
        </div>
      </div>
    </div>
  );
}
