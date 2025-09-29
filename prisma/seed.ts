// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const IMAGE_URL = 'https://i.pinimg.com/736x/f8/29/ef/f829efb8940140c34a116091a7f74b6e.jpg';

// async function main() {
//   console.log('🌱 Starting seed...');

//   // Clear existing data
//   console.log('🧹 Cleaning database...');
//   await prisma.notification.deleteMany();
//   await prisma.orderItem.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.cartItem.deleteMany();
//   await prisma.cart.deleteMany();
//   await prisma.variantOption.deleteMany();
//   await prisma.productVariant.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.attributeValue.deleteMany();
//   await prisma.attribute.deleteMany();
//   await prisma.subCategory.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.brand.deleteMany();

//   // Create Brands
//   console.log('👕 Creating brands...');
//   const brands = await Promise.all([
//     prisma.brand.create({ data: { name: 'Little Explorers' } }),
//     prisma.brand.create({ data: { name: 'Tiny Tots' } }),
//     prisma.brand.create({ data: { name: 'Kids Avenue' } }),
//     prisma.brand.create({ data: { name: 'Wonder Kids' } }),
//     prisma.brand.create({ data: { name: 'Happy Hearts' } }),
//   ]);

//   // Create Attributes
//   console.log('🎨 Creating attributes...');
//   const colorAttr = await prisma.attribute.create({
//     data: { name: 'Color' },
//   });

//   const sizeAttr = await prisma.attribute.create({
//     data: { name: 'Size' },
//   });

//   // Create Attribute Values
//   const colors = await Promise.all([
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Red' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Blue' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Pink' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Yellow' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Green' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'White' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Black' } }),
//     prisma.attributeValue.create({ data: { attributeId: colorAttr.id, value: 'Navy' } }),
//   ]);

//   const sizes = await Promise.all([
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'XXS' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'XS' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'S' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'M' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'L' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'XL' } }),
//     prisma.attributeValue.create({ data: { attributeId: sizeAttr.id, value: 'XXL' } }),
//   ]);

//   // Create Categories with SubCategories
//   console.log('📦 Creating categories...');
//   const topsCategory = await prisma.category.create({
//     data: {
//       name: 'Tops',
//       image: IMAGE_URL,
//     },
//   });

//   const topsSubcategories = await Promise.all([
//     prisma.subCategory.create({ data: { name: 'T-Shirts', categoryId: topsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Shirts', categoryId: topsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Hoodies', categoryId: topsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Sweaters', categoryId: topsCategory.id } }),
//   ]);

//   const bottomsCategory = await prisma.category.create({
//     data: {
//       name: 'Bottoms',
//       image: IMAGE_URL,
//     },
//   });

//   const bottomsSubcategories = await Promise.all([
//     prisma.subCategory.create({ data: { name: 'Jeans', categoryId: bottomsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Shorts', categoryId: bottomsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Pants', categoryId: bottomsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Skirts', categoryId: bottomsCategory.id } }),
//   ]);

//   const dressesCategory = await prisma.category.create({
//     data: {
//       name: 'Dresses',
//       image: IMAGE_URL,
//     },
//   });

//   const dressesSubcategories = await Promise.all([
//     prisma.subCategory.create({ data: { name: 'Casual Dresses', categoryId: dressesCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Party Dresses', categoryId: dressesCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Summer Dresses', categoryId: dressesCategory.id } }),
//   ]);

//   const outerwearsCategory = await prisma.category.create({
//     data: {
//       name: 'Outerwear',
//       image: IMAGE_URL,
//     },
//   });

//   const outerwearSubcategories = await Promise.all([
//     prisma.subCategory.create({ data: { name: 'Jackets', categoryId: outerwearsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Coats', categoryId: outerwearsCategory.id } }),
//     prisma.subCategory.create({ data: { name: 'Raincoats', categoryId: outerwearsCategory.id } }),
//   ]);

//   // Helper function to create variants
//   async function createVariants(
//     productId: string,
//     variants: Array<{ color: any; size: any; price: number; qty: number; sku: string }>,
//     colorAttrId: string,
//     sizeAttrId: string
//   ) {
//     for (const v of variants) {
//       const variant = await prisma.productVariant.create({
//         data: {
//           productId,
//           sku: v.sku,
//           price: v.price,
//           qty: v.qty,
//           images: [IMAGE_URL, IMAGE_URL, IMAGE_URL],
//         },
//       });

//       await prisma.variantOption.createMany({
//         data: [
//           {
//             productVariantId: variant.id,
//             attributeId: colorAttrId,
//             valueId: v.color.id,
//           },
//           {
//             productVariantId: variant.id,
//             attributeId: sizeAttrId,
//             valueId: v.size.id,
//           },
//         ],
//       });
//     }
//   }

//   // Create Products with Variants
//   console.log('🛍️ Creating products...');

//   // Product 1: Dinosaur Graphic T-Shirt
//   const product1 = await prisma.product.create({
//     data: {
//       name: 'Dinosaur Graphic T-Shirt',
//       description: 'Fun dinosaur print cotton t-shirt perfect for everyday wear',
//       image: IMAGE_URL,
//       brandId: brands[0].id,
//       categoryId: topsCategory.id,
//       subCategoryId: topsSubcategories[0].id,
//     },
//   });

//   await createVariants(
//     product1.id,
//     [
//       { color: colors[1], size: sizes[2], price: 399, qty: 25, sku: 'DINO-BLUE-S' },
//       { color: colors[1], size: sizes[3], price: 399, qty: 30, sku: 'DINO-BLUE-M' },
//       { color: colors[1], size: sizes[4], price: 399, qty: 20, sku: 'DINO-BLUE-L' },
//       { color: colors[3], size: sizes[2], price: 399, qty: 20, sku: 'DINO-YEL-S' },
//       { color: colors[3], size: sizes[3], price: 399, qty: 15, sku: 'DINO-YEL-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 2: Floral Print Dress
//   const product2 = await prisma.product.create({
//     data: {
//       name: 'Floral Print Summer Dress',
//       description: 'Beautiful floral dress with comfortable cotton fabric',
//       image: IMAGE_URL,
//       brandId: brands[4].id,
//       categoryId: dressesCategory.id,
//       subCategoryId: dressesSubcategories[2].id,
//     },
//   });

//   await createVariants(
//     product2.id,
//     [
//       { color: colors[2], size: sizes[1], price: 799, qty: 15, sku: 'FLORAL-PINK-XS' },
//       { color: colors[2], size: sizes[2], price: 799, qty: 20, sku: 'FLORAL-PINK-S' },
//       { color: colors[2], size: sizes[3], price: 799, qty: 18, sku: 'FLORAL-PINK-M' },
//       { color: colors[5], size: sizes[2], price: 799, qty: 12, sku: 'FLORAL-WHT-S' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 3: Denim Jeans
//   const product3 = await prisma.product.create({
//     data: {
//       name: 'Classic Denim Jeans',
//       description: 'Comfortable stretch denim jeans with adjustable waist',
//       image: IMAGE_URL,
//       brandId: brands[2].id,
//       categoryId: bottomsCategory.id,
//       subCategoryId: bottomsSubcategories[0].id,
//     },
//   });

//   await createVariants(
//     product3.id,
//     [
//       { color: colors[1], size: sizes[2], price: 899, qty: 30, sku: 'JEANS-BLUE-S' },
//       { color: colors[1], size: sizes[3], price: 899, qty: 35, sku: 'JEANS-BLUE-M' },
//       { color: colors[1], size: sizes[4], price: 899, qty: 25, sku: 'JEANS-BLUE-L' },
//       { color: colors[6], size: sizes[3], price: 899, qty: 20, sku: 'JEANS-BLK-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 4: Striped Polo Shirt
//   const product4 = await prisma.product.create({
//     data: {
//       name: 'Striped Polo Shirt',
//       description: 'Classic striped polo shirt for boys',
//       image: IMAGE_URL,
//       brandId: brands[1].id,
//       categoryId: topsCategory.id,
//       subCategoryId: topsSubcategories[1].id,
//     },
//   });

//   await createVariants(
//     product4.id,
//     [
//       { color: colors[7], size: sizes[2], price: 599, qty: 22, sku: 'POLO-NAVY-S' },
//       { color: colors[7], size: sizes[3], price: 599, qty: 28, sku: 'POLO-NAVY-M' },
//       { color: colors[0], size: sizes[2], price: 599, qty: 18, sku: 'POLO-RED-S' },
//       { color: colors[0], size: sizes[3], price: 599, qty: 15, sku: 'POLO-RED-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 5: Cotton Shorts
//   const product5 = await prisma.product.create({
//     data: {
//       name: 'Cotton Summer Shorts',
//       description: 'Lightweight cotton shorts perfect for hot days',
//       image: IMAGE_URL,
//       brandId: brands[3].id,
//       categoryId: bottomsCategory.id,
//       subCategoryId: bottomsSubcategories[1].id,
//     },
//   });

//   await createVariants(
//     product5.id,
//     [
//       { color: colors[4], size: sizes[1], price: 449, qty: 25, sku: 'SHORT-GRN-XS' },
//       { color: colors[4], size: sizes[2], price: 449, qty: 30, sku: 'SHORT-GRN-S' },
//       { color: colors[4], size: sizes[3], price: 449, qty: 22, sku: 'SHORT-GRN-M' },
//       { color: colors[7], size: sizes[2], price: 449, qty: 20, sku: 'SHORT-NAVY-S' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 6: Party Dress
//   const product6 = await prisma.product.create({
//     data: {
//       name: 'Princess Party Dress',
//       description: 'Elegant party dress with sparkly details',
//       image: IMAGE_URL,
//       brandId: brands[4].id,
//       categoryId: dressesCategory.id,
//       subCategoryId: dressesSubcategories[1].id,
//     },
//   });

//   await createVariants(
//     product6.id,
//     [
//       { color: colors[2], size: sizes[2], price: 1299, qty: 12, sku: 'PARTY-PINK-S' },
//       { color: colors[2], size: sizes[3], price: 1299, qty: 15, sku: 'PARTY-PINK-M' },
//       { color: colors[2], size: sizes[4], price: 1299, qty: 10, sku: 'PARTY-PINK-L' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 7: Hoodie
//   const product7 = await prisma.product.create({
//     data: {
//       name: 'Cozy Fleece Hoodie',
//       description: 'Warm and comfortable hoodie with front pocket',
//       image: IMAGE_URL,
//       brandId: brands[0].id,
//       categoryId: topsCategory.id,
//       subCategoryId: topsSubcategories[2].id,
//     },
//   });

//   await createVariants(
//     product7.id,
//     [
//       { color: colors[6], size: sizes[2], price: 999, qty: 20, sku: 'HOODIE-BLK-S' },
//       { color: colors[6], size: sizes[3], price: 999, qty: 25, sku: 'HOODIE-BLK-M' },
//       { color: colors[6], size: sizes[4], price: 999, qty: 18, sku: 'HOODIE-BLK-L' },
//       { color: colors[4], size: sizes[3], price: 999, qty: 15, sku: 'HOODIE-GRN-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 8: Winter Jacket
//   const product8 = await prisma.product.create({
//     data: {
//       name: 'Puffer Winter Jacket',
//       description: 'Warm puffer jacket for cold weather',
//       image: IMAGE_URL,
//       brandId: brands[2].id,
//       categoryId: outerwearsCategory.id,
//       subCategoryId: outerwearSubcategories[0].id,
//     },
//   });

//   await createVariants(
//     product8.id,
//     [
//       { color: colors[7], size: sizes[2], price: 1899, qty: 15, sku: 'JACKET-NAVY-S' },
//       { color: colors[7], size: sizes[3], price: 1899, qty: 20, sku: 'JACKET-NAVY-M' },
//       { color: colors[7], size: sizes[4], price: 1899, qty: 12, sku: 'JACKET-NAVY-L' },
//       { color: colors[0], size: sizes[3], price: 1899, qty: 10, sku: 'JACKET-RED-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 9: Cotton Skirt
//   const product9 = await prisma.product.create({
//     data: {
//       name: 'Pleated Cotton Skirt',
//       description: 'Comfortable pleated skirt for girls',
//       image: IMAGE_URL,
//       brandId: brands[4].id,
//       categoryId: bottomsCategory.id,
//       subCategoryId: bottomsSubcategories[3].id,
//     },
//   });

//   await createVariants(
//     product9.id,
//     [
//       { color: colors[2], size: sizes[2], price: 549, qty: 18, sku: 'SKIRT-PINK-S' },
//       { color: colors[2], size: sizes[3], price: 549, qty: 22, sku: 'SKIRT-PINK-M' },
//       { color: colors[7], size: sizes[2], price: 549, qty: 15, sku: 'SKIRT-NAVY-S' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 10: Sweater
//   const product10 = await prisma.product.create({
//     data: {
//       name: 'Knit Pullover Sweater',
//       description: 'Soft knit sweater for cool weather',
//       image: IMAGE_URL,
//       brandId: brands[1].id,
//       categoryId: topsCategory.id,
//       subCategoryId: topsSubcategories[3].id,
//     },
//   });

//   await createVariants(
//     product10.id,
//     [
//       { color: colors[0], size: sizes[2], price: 849, qty: 20, sku: 'SWEATER-RED-S' },
//       { color: colors[0], size: sizes[3], price: 849, qty: 25, sku: 'SWEATER-RED-M' },
//       { color: colors[1], size: sizes[2], price: 849, qty: 18, sku: 'SWEATER-BLUE-S' },
//       { color: colors[1], size: sizes[3], price: 849, qty: 15, sku: 'SWEATER-BLUE-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 11: Cargo Pants
//   const product11 = await prisma.product.create({
//     data: {
//       name: 'Cargo Pants',
//       description: 'Durable cargo pants with multiple pockets',
//       image: IMAGE_URL,
//       brandId: brands[3].id,
//       categoryId: bottomsCategory.id,
//       subCategoryId: bottomsSubcategories[2].id,
//     },
//   });

//   await createVariants(
//     product11.id,
//     [
//       { color: colors[4], size: sizes[3], price: 799, qty: 22, sku: 'CARGO-GRN-M' },
//       { color: colors[4], size: sizes[4], price: 799, qty: 18, sku: 'CARGO-GRN-L' },
//       { color: colors[6], size: sizes[3], price: 799, qty: 20, sku: 'CARGO-BLK-M' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   // Product 12: Raincoat
//   const product12 = await prisma.product.create({
//     data: {
//       name: 'Waterproof Raincoat',
//       description: 'Fun printed raincoat to keep kids dry',
//       image: IMAGE_URL,
//       brandId: brands[0].id,
//       categoryId: outerwearsCategory.id,
//       subCategoryId: outerwearSubcategories[2].id,
//     },
//   });

//   await createVariants(
//     product12.id,
//     [
//       { color: colors[3], size: sizes[2], price: 699, qty: 25, sku: 'RAIN-YEL-S' },
//       { color: colors[3], size: sizes[3], price: 699, qty: 30, sku: 'RAIN-YEL-M' },
//       { color: colors[1], size: sizes[2], price: 699, qty: 20, sku: 'RAIN-BLUE-S' },
//     ],
//     colorAttr.id,
//     sizeAttr.id
//   );

//   console.log('✅ Seed completed successfully!');
//   console.log(`📊 Created:
//   - ${brands.length} brands
//   - 4 categories with subcategories
//   - 12 products with multiple variants
//   - ${colors.length} colors
//   - ${sizes.length} sizes
//   `);
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });