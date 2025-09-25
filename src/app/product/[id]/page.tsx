// app/product/[id]/page.tsx
import ProductDetails from "@/components/productdetails/Productdetails";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  
  return {
    title: `Product ${id}`, 
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="w-full min-h-screen px-6 py-10">
      <ProductDetails productId={id} />
    </div>
  );
}