import Header from "../components/Header";
import Banner from "../components/Banner";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";

export default function Homepage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <Banner />
      <ProductList />
      <Footer />
    </div>
  );
}
