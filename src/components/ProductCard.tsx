

import React, { useState, useTransition } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { addToCart } from '@/server/actions/cart-action';
import { toast } from 'sonner';
import Image from 'next/image';

// Updated ProductProps with id
type ProductProps = {
  id: string;           // ✅ Added id prop
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  description?: string;
};

export default function ProductCard({ 
  id,                   // ✅ Added id parameter
  name, 
  price, 
  oldPrice, 
  image, 
  rating = 0, 
  reviews = 0,
  badge,
  description 
}: ProductProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const discountPercentage = oldPrice ? 
    Math.round(((parseFloat(oldPrice.replace(/[₹$]/g, '')) - parseFloat(price.replace(/[₹$]/g, ''))) / parseFloat(oldPrice.replace
      (/[₹$]/g, ''))) * 100) : 0;

  // Add to cart function
  const handleAddToCart = async () => {
    if (!id) {
      console.error('Product ID is missing');
      toast.error('Product ID is missing');
      return;
    }

    startTransition(async () => {
      try {
        console.log('Adding to cart:', { productId: id, quantity: 1 });
        await addToCart({ productId: id, quantity: 1 });
        
        toast.success(`Added "${name}" to cart!`);
        
        // Navigate to cart page after successful addition
        window.location.href = '/cart';
        
      } catch (error) {
        console.error('Failed to add to cart:', error);
        toast.error('Failed to add to cart. Please try again.');
      }
    });
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300
     overflow-hidden">
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {badge}
        </div>
      )}
      
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          -{discountPercentage}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 
        transition-all duration-200 hover:bg-white"
        style={discountPercentage > 0 ? { top: '3rem', right: '0.75rem' } : {}}
      >
        <Heart 
          size={16} 
          className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
        />
      </button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating.toFixed(1)} {reviews > 0 && `(${reviews} reviews)`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">{price}</span>
          {oldPrice && (
            <span className="text-sm text-gray-500 line-through">{oldPrice}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 active:scale-95
           transition-all duration-200">
            Buy Now
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={isPending}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {isPending ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}