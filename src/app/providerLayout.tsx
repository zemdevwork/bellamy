// src/components/ProvidersLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ProvidersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noHeaderRoutes = ["/", "/login", "/sign-up", "/dashboard-login"];
  const hideHeader =
    noHeaderRoutes.includes(pathname) || pathname.startsWith("/admin");

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
