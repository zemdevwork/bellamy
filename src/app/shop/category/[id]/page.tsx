import Footer from "@/components/Footer";
import ShopProductListing from "@/components/shop-productlisting";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div>
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-serif mb-6">Category Products</h1>
      <ShopProductListing categoryId={id} hideCategoryFilter />
    </div>
    <Footer/>
    </div>
    
  );
}
