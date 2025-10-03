import Footer from "@/components/Footer";
import ShopProductListing from "@/components/shop-productlisting";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <div className="page-wrap min-h-screen">
        <ShopProductListing categoryId={id} hideCategoryFilter={true} />
      </div>
      <Footer/>
    </div>
  );
}
