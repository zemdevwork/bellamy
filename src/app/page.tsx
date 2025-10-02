import Banner from "../components/Banner";
import CategorySection from "@/components/home-category/categoryListing";
import ProductList from "../components/ProductList";
import BestSellers from "../components/BestSellers";
import Footer from "../components/Footer";
import CTAComponent from "@/components/CTAComponent";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      {/* Hero */}
      <Banner />

      {/* Shop by Occasion */}
      <CategorySection />

      {/* Best Sellers */}
      <BestSellers />

      {/* Product grid */}
      <ProductList />
      
      {/* CTA */}
      <CTAComponent />

      <Footer />
    </div>
  );
}