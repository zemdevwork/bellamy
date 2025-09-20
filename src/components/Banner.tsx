import Image from "next/image";

export default function Banner() {
    return (
      <section className="relative bg-[#f0f7ff] flex flex-col md:flex-row items-center justify-between px-10 py-20">
        {/* Text */}
        <div className="max-w-xl">
          <h2 className="text-5xl font-bold text-blue-900 mb-6">
            Dress Your Kids <br /> In Comfort & Style
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Discover trendy, comfy, and affordable kidswear for every occasion.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700">
            SHOP NOW
          </button>
        </div>
  
        {/* Image */}
        <div className="flex space-x-6 mt-10 md:mt-0">
          <Image
            width={400}
            height={300}
            src="/Images/Banner.jpg"
            alt="Kidswear Product"
            className="w-180 h-100 object-contain rounded-lg"
          />
        </div>
      </section>
    );
  }
  