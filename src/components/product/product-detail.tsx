// app/products/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getProductById } from '@/server/actions/product-action'; 
import { ProductDeleteDialog } from './delete-product-dialog'; 
import { ProductFormDialog } from './product-dialog-form'; 
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Pencil, 
  Trash2, 
  Loader2, 
  Tag, 
  Boxes, 
  IndianRupee,
  Info,
  ImageIcon
} from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface ProductDetailProps {
   id: string;
}

export default function ProductDetailPage({ id }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProductById(id);
        if (!fetchedProduct.success) {
          toast.error(fetchedProduct.message || 'Product not found');
          return
        }
        if( !fetchedProduct.data ) {
          toast.error('Product not found');
          return;
        }
        setProduct(fetchedProduct.data);
        setSelectedImage(fetchedProduct.data.image);
        if (fetchedProduct.data.attributes && Array.isArray(fetchedProduct.data.attributes)) {
          setAttributes(fetchedProduct.data.attributes as { key: string; value: string }[]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-200' };
    if (qty <= 5) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-primary mx-auto" size={48} />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus(product.qty);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground mt-1">Product ID: {product.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUpdateDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.subimage && product.subimage.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {/* Main image thumbnail */}
                <button
                  onClick={() => setSelectedImage(product.image)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === product.image ? 'border-primary' : 'border-muted'
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} main`}
                    fill
                    className="object-cover"
                  />
                </button>
                
                {/* Sub images thumbnails */}
                {product.subimage.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === img ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Information Section */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{product.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="font-semibold">{product.brand?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{product.category?.name || 'N/A'}</p>
                </div>
              </div>
              
              {product.subCategory && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                  <p className="font-semibold">{product.subCategory.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing and Stock Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold">₹{product.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Stock Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{product.qty}</strong> units available
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Specifications Card */}
          {attributes && attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attributes.map((attribute, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-muted last:border-b-0">
                      <span className="font-medium text-sm">{attribute.key}</span>
                      <span className="text-sm text-muted-foreground">{attribute.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modals for Update and Delete */}
      <ProductFormDialog
        product={product}
        open={isUpdateDialogOpen}
        openChange={setIsUpdateDialogOpen}
      />
      <ProductDeleteDialog
        product={product}
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
      />
    </div>
  );
}