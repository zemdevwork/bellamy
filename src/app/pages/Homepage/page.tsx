import Header from "../../../components/Header";
import Banner from "../../../components/Banner";
import ProductList from "../../../components/ProductList";

export default function Homepage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <Banner />
      <ProductList />
    </div>
  );
}
