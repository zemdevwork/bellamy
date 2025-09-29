import Banner from "../components/Banner";
import CategorySection from "@/components/home-category/categoryListing";
import ProductList from "../components/ProductList";
import BestSellers from "../components/BestSellers";
import Footer from "../components/Footer";

export default function Homepage() {
  return (
    <div className="bg-white min-h-screen">
      <Banner />
      <CategorySection/>
      <BestSellers />
      <ProductList />
      <Footer />
    </div>
  );
}
