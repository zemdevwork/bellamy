import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import BestSellers from "../components/BestSellers";
import Footer from "../components/Footer";
import ProductDetails from "@/components/productdetails/page";

export default function Homepage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <Banner />
      <BestSellers />
      <ProductDetails/>
      <ProductList />
      <Footer />
    </div>
  );
}
