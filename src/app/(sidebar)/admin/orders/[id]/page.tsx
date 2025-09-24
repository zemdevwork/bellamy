import { getOrderByID } from "@/server/actions/admin-order-action"; 
import OrderDetail from "@/components/admin/order/order-detail-page"; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderByID(id);

  if (!order) {
    return <div className="p-6 text-red-500">Order not found</div>;
  }

  return <OrderDetail order={order} />;
}