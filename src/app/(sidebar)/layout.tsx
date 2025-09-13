import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
