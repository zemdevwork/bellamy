import Footer from '@/components/Footer';
import ShopList from '@/components/shoplist';
import React from 'react'

function ShopPage() {
  return (
      <div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        <ShopList />
      </div>
      <Footer/>
      </div>
      
    );
}

export default ShopPage