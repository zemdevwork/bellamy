import Banner from "../components/Banner";
import CategorySection from "@/components/home-category/categoryListing";
import ProductList from "../components/ProductList";
import BestSellers from "../components/BestSellers";
import Footer from "../components/Footer";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f5] via-white to-[#fff8f5] text-stone-900">
      {/* Hero */}
      <Banner />

      {/* Shop by Occasion with soft radial accent backdrop */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,114,182,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <CategorySection />
        </div>
      </section>

      {/* Best Sellers on a clean canvas with gentle separators */}
      <section className="relative bg-white/80 backdrop-blur-[1px]">
        <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-stone-200/40 to-transparent" />
        <div className="absolute inset-x-0 -bottom-6 h-6 bg-gradient-to-t from-stone-200/40 to-transparent" />
        <BestSellers />
      </section>

      {/* Product grid on warm canvas to echo brand vibe */}
      <section className="relative bg-white/80">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_rgba(234,179,8,0.06),transparent_55%)]" />
        <div className="relative">
          <ProductList />
        </div>
      </section>

      <Footer />
    </div>
  );
}
