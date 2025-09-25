import Footer from '@/components/Footer';
import ShopProductListing from '@/components/shop-productlisting';
import React from 'react'

function ShopPage() {
  return (
      <div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Category Products</h1>
        <ShopProductListing categoryId={""} />
      </div>
      <Footer/>
      </div>
      
    );
}

export default ShopPage