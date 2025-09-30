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
import { useCart } from "@/context/cartContext";

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
};

export default function CheckoutModal({
  products,
  total,
  onClose,
}: CheckoutModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const {updateCartCount} = useCart();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 6) {
      setPincode(value);
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !street || !city || !state || !pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (pincode.length !== 6) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          phoneNumber,
          street,
          city,
          state,
          pincode,
          items: products.map((p) => ({
            variantId: p.id,
            quantity: p.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        throw new Error(data.error || "Failed to place order");
      }

      await updateCartCount();
      toast.success("Order placed successfully!");
      onClose();
      router.push("/user-profile");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
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
          {/* Order summary (collapsible) */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
            >
              <div className="flex items-center gap-3">
                <Label className="text-lg font-semibold text-gray-900 cursor-pointer">
                  Order summary ({products.length} Items)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{total.toFixed(2)}
                </span>
                {isOrderSummaryOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>

            {/* Collapsible content */}
            {isOrderSummaryOpen && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg"
                    >
                      {product.image && (
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(product.price * product.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sub total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                    <span>Total amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900">
              Payment Method
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  Cash on Delivery
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="ONLINE" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  Online Payment
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900">
              Delivery Address
            </Label>
            <div className="space-y-3">
              {/* ✅ Phone Number - Numbers only */}
              <Input
                placeholder="Phone Number (10 digits)"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="h-12"
              />
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
              {/* ✅ Pincode - Numbers only */}
              <Input
                placeholder="Pincode (6 digits)"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pincode}
                onChange={handlePincodeChange}
                className="h-12"
              />
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
        </div>
      </div>
    </div>
  );
}