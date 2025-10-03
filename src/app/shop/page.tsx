import Footer from '@/components/Footer';
import ShopList from '@/components/shoplist';
import React from 'react'

function ShopPage() {
  return (
      <div>
      <div className="page-wrap min-h-screen">
        <h1 className="page-title mb-6">Products</h1>
        <ShopList />
      </div>
      <Footer/>
      </div>
      
    );
}

export default ShopPage