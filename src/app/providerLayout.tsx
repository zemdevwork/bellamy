// src/components/ProvidersLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { CartProvider } from "@/context/cartContext";

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noHeaderRoutes = ["/login", "/sign-up", "/dashboard-login"];
  const hideHeader =
    noHeaderRoutes.includes(pathname) || pathname.startsWith("/admin");

  return (
    <CartProvider>
      {!hideHeader && <Header />}
      {children}
    </CartProvider>
  );
}