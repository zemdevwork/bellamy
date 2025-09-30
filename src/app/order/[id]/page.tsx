import OrderDetail from '@/components/orders/OrderDetail'
import React from 'react'

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  
  return (
    <OrderDetail id={id} />
  )
}

export default OrderPage