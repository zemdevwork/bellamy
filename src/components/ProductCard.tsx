import Image from "next/image";

type ProductProps = {
    name: string;
    price: string;
    oldPrice?: string;
    image: string;
    rating?: number;
  };
  
  export default function ProductCard({ name, price, oldPrice, image, rating }: ProductProps) {
    return (
      <div className="bg-white shadow-sm p-4 rounded-md text-center">
        <Image src={image} alt={name} className="w-full h-64 object-contain mb-4" width={400} height={300} />
        
        <h3 className="text-lg font-medium">{name}</h3>
        
        {/* Ratings */}
        {rating && (
          <p className="text-yellow-500">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</p>
        )}
  
        {/* Price */}
        <div className="mt-2">
          {oldPrice && <span className="line-through text-gray-400 mr-2">{oldPrice}</span>}
          <span className="text-lg font-semibold">{price}</span>
        </div>
  
        <button className="border border-black px-4 py-2 mt-4 rounded-md hover:bg-black hover:text-white">
          Choose options
        </button>
      </div>
    );
  }
  