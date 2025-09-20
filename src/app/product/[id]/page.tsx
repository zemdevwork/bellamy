// app/product/[id]/page.tsx
import ProductDetails from "@/components/productdetails/Productdetails";

type Props = {
  params: { id: string };
};

export default function ProductPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <ProductDetails productId={id} />
    </div>
  );
}
