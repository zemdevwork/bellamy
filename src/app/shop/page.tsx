import CategoryList from "@/components/Shoplisting";
import ProductList from "@/components/ProductList";

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Categories */}
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>
      <CategoryList />

      {/* Products */}
      <h2 className="text-2xl font-bold mb-6">All Products</h2>
      <ProductList />
    </div>
  );
}
