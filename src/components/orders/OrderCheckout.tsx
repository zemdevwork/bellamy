

// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { toast } from "sonner";
// import { ChevronDown, ChevronUp, X } from "lucide-react";

// type Product = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image?: string;
// };

// type CheckoutModalProps = {
//   products: Product[];
//   total: number;
//   onClose: () => void;
//   userPhone?: string; // from logged-in user
// };

// export default function CheckoutModal({
//   products,
//   total,
//   onClose,
//   userPhone,
// }: CheckoutModalProps) {
//   const router = useRouter();
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [phone, setPhone] = useState(userPhone || "");
//   const [street, setStreet] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [pincode, setPincode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

//   const handleSubmit = async () => {
//     if (!street || !city || !state || !pincode || !phone) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           paymentMethod,
//           phone,
//           street,
//           city,
//           state,
//           pincode,
//           totalAmount: total,
//           items: products.map((p) => ({
//             productId: p.id,
//             quantity: p.quantity,
//             price: p.price,
//           })),
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to place order");

//       toast.success("Order placed successfully!");
//       onClose();
//       router.push("/order");
//     } catch (err) {
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header with close button */}
//         <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             >
//               <X className="w-6 h-6 text-gray-500" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Promotional Banner */}
//           <div className="bg-black text-white text-center py-3 px-4 rounded-lg">
//             <p className="font-medium">Get 5% off on Prepaid Order</p>
//           </div>

//           {/* Collapsible Order Summary */}
//           <div className="border border-gray-200 rounded-xl overflow-hidden">
//             <button
//               onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
//               className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
//             >
//               <div className="flex items-center gap-3">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Order summary
//                 </h3>
//                 <span className="text-sm text-gray-600">
//                   ({products.length} Items)
//                 </span>
//               </div>
//               <div className="flex items-center gap-4">
//                 <span className="text-lg font-bold text-gray-900">
//                   ₹{total.toFixed(2)}
//                 </span>
//                 {isOrderSummaryOpen ? (
//                   <ChevronUp className="w-5 h-5 text-gray-600" />
//                 ) : (
//                   <ChevronDown className="w-5 h-5 text-gray-600" />
//                 )}
//               </div>
//             </button>

//             {/* Expandable Product List */}
//             {isOrderSummaryOpen && (
//               <div className="px-6 py-4 space-y-4 border-t border-gray-100">
//                 {products.map((product) => (
//                   <div key={product.id} className="flex items-center gap-4">
//                     {/* Product Image */}
//                     <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                       {product.image ? (
//                         <Image
//                           src={product.image}
//                           alt={product.name}
//                           fill
//                           className="object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                           <span className="text-xs text-gray-500 font-medium">
//                             {product.name.substring(0, 2).toUpperCase()}
//                           </span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Product Details */}
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
//                         {product.name}
//                       </h4>
//                       <p className="text-sm font-semibold text-gray-900 mt-1">
//                         ₹{product.price.toFixed(2)}
//                       </p>
//                     </div>

//                     {/* Quantity Controls */}
//                     <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
//                       <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
//                         -
//                       </button>
//                       <span className="font-medium text-gray-900 min-w-[20px] text-center">
//                         {product.quantity}
//                       </span>
//                       <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
//                         +
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Bill Summary */}
//                 <div className="border-t border-gray-200 pt-4 space-y-2">
//                   <h4 className="font-semibold text-gray-900 mb-3">Bill summary</h4>
//                   <div className="flex justify-between text-sm text-gray-600">
//                     <span>Sub total</span>
//                     <span>₹{total.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
//                     <span>Total amount</span>
//                     <span>₹{total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Mobile Number */}
//           <div className="space-y-2">
//             <Label htmlFor="phone" className="text-lg font-semibold text-gray-900">Mobile Number</Label>
//             <Input
//               id="phone"
//               type="tel"
//               placeholder="Enter 10-digit mobile number"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               className="h-12"
//             />
//           </div>

//           {/* Payment Method */}
//           <div className="space-y-3">
//             <Label className="text-lg font-semibold text-gray-900">Payment Method</Label>
//             <RadioGroup
//               value={paymentMethod}
//               onValueChange={setPaymentMethod}
//               className="space-y-3"
//             >
//               <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 <RadioGroupItem value="COD" id="cod" className="text-blue-600" />
//                 <Label htmlFor="cod" className="flex-1 cursor-pointer">Cash on Delivery</Label>
//               </div>
//               <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
//                 <RadioGroupItem value="ONLINE" id="online" className="text-blue-600" />
//                 <Label htmlFor="online" className="flex-1 cursor-pointer">Online Payment</Label>
//               </div>
//             </RadioGroup>
//           </div>

//           {/* Delivery Address */}
//           <div className="space-y-3">
//             <Label className="text-lg font-semibold text-gray-900">Delivery Address</Label>
//             <div className="space-y-3">
//               <Input
//                 placeholder="Street Address"
//                 value={street}
//                 onChange={(e) => setStreet(e.target.value)}
//                 className="h-12"
//               />
//               <div className="grid grid-cols-2 gap-3">
//                 <Input
//                   placeholder="City"
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   className="h-12"
//                 />
//                 <Input
//                   placeholder="State"
//                   value={state}
//                   onChange={(e) => setState(e.target.value)}
//                   className="h-12"
//                 />
//               </div>
//               <Input
//                 placeholder="Pincode"
//                 value={pincode}
//                 onChange={(e) => setPincode(e.target.value)}
//                 className="h-12"
//               />
//             </div>
//           </div>

//           {/* Trust Badges */}
//           <div className="flex items-center justify-center gap-8 py-4 text-xs text-gray-500">
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
//                 <div className="w-4 h-4 bg-gray-400 rounded"></div>
//               </div>
//               <span>Secure payments</span>
//             </div>
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
//                 <div className="w-4 h-4 bg-gray-400 rounded"></div>
//               </div>
//               <span>Assured delivery</span>
//             </div>
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
//                 <div className="w-4 h-4 bg-gray-400 rounded"></div>
//               </div>
//               <span>Verified seller</span>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <Button
//             className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-xl"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Placing Order..." : "Buy it now"}
//           </Button>

//           {/* Footer */}
//           <div className="text-center text-xs text-gray-500">
//             <p>T&C | Privacy Policy | b902f6ee</p>
//             <p className="mt-1">Powered By Shiprocket</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, X } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CheckoutModalProps = {
  products: Product[];
  total: number;
  onClose: () => void;
  userPhone?: string; // from logged-in user
};

export default function CheckoutModal({
  products,
  total,
  onClose,
  userPhone,
}: CheckoutModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [phone, setPhone] = useState(userPhone || "");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  const handleSubmit = async () => {
    if (!street || !city || !state || !pincode || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          phone,
          street,
          city,
          state,
          pincode,
          totalAmount: total,
          items: products.map((p) => ({
            productId: p.id,
            quantity: p.quantity,
            price: p.price,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to place order");

      toast.success("Order placed successfully!");
      onClose();
      router.push("/order");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Promotional Banner */}
          <div className="bg-black text-white text-center py-3 px-4 rounded-lg">
            <p className="font-medium">Get 5% off on Prepaid Order</p>
          </div>

          {/* Collapsible Order Summary */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order summary
                </h3>
                <span className="text-sm text-gray-600">
                  ({products.length} Items)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-900">
                  ₹{total.toFixed(2)}
                </span>
                {isOrderSummaryOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {/* Expandable Product List */}
            {isOrderSummaryOpen && (
              <div className="px-6 py-4 space-y-4 border-t border-gray-100">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">
                            {product.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
                        -
                      </button>
                      <span className="font-medium text-gray-900 min-w-[20px] text-center">
                        {product.quantity}
                      </span>
                      <button className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
                        +
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bill Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Bill summary</h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sub total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-lg font-semibold text-gray-900">Mobile Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="COD" id="cod" className="text-blue-600" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">Cash on Delivery</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="ONLINE" id="online" className="text-blue-600" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">Online Payment</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900">Delivery Address</Label>
            <div className="space-y-3">
              <Input
                placeholder="Street Address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="h-12"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12"
                />
                <Input
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-12"
                />
              </div>
              <Input
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 py-4 text-xs text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </div>
              <span>Secure payments</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </div>
              <span>Assured delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </div>
              <span>Verified seller</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-xl"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Buy it now"}
          </Button>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>T&C | Privacy Policy | b902f6ee</p>
            <p className="mt-1">Powered By Shiprocket</p>
          </div>
        </div>
      </div>
    </div>
  );
}
