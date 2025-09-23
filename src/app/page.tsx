import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import BestSellers from "../components/BestSellers";
import Footer from "../components/Footer";

export default function Homepage() {
  return (
    <div className="bg-white min-h-screen">
      <Banner />
      <BestSellers />
      <ProductList />
      <Footer />
    </div>
  );
}
