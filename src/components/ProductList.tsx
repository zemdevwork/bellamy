import Image from "next/image";

const products = [
  { id: 1, name: "Boys", price: "₹450", image: "/Images/banner.jpg" },
  { id: 2, name: "Girls", price: "₹550", image: "/Images/banner.jpg" },
  { id: 3, name: "Babies", price: "₹350", image: "/Images/banner.jpg" },
];

export default function ProductList() {
  return (
    <section className="py-10 px-6">
      <h2 className="text-2xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow-sm hover:shadow-md transition p-4"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg"
            />
            <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
            <p className="text-gray-700">{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
