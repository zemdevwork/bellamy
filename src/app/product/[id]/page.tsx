import ProductDetails from "@/components/productdetails/Productdetails";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  image: string;
  brand?: { id: string; name: string };
  price: number;
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch product for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const productName = product.name
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  const brandName = product.brand?.name
    ? product.brand.name.replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  return {
    title: `${productName}${brandName ? ` - ${brandName}` : ""}`,
    description: product.description || `Buy ${productName}${brandName ? ` by ${brandName}` : ""} at the best price. Shop now!`,
    openGraph: {
      title: productName,
      description: product.description || `Buy ${productName} at the best price`,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: productName,
      description: product.description || `Buy ${productName} at the best price`,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="page-wrap min-h-screen">
      <ProductDetails productId={id} />
    </div>
  );
}