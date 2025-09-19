import React from 'react'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Await the params promise to get the id
  const { id } = await params
  
  return (
    <div>
      <h1>Product Detail Page</h1>
      <p>Product ID: {id}</p>
    </div>
  )
}

export default ProductDetailPage