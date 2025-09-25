import UserDetail from "@/components/admin/admin-user/UserDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;


  return <UserDetail id={id} />;
}