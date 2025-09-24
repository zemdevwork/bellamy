import { JsonValue } from "@prisma/client/runtime/library";

export interface ProductAttributes {
  key: string;
  value: string;
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: string;
      name: string;
      description: string | null;
      attributes: JsonValue;
      qty: number;
      image: string;
      subimage: string[];
      createdAt: Date;
      updatedAt: Date;
      brand: {
        id: string;
        name: string;
      } | null;
      category: {
        id: string;
        name: string;
        image: string;
      } | null;
      subCategory: {
        id: string;
        name: string;
      } | null;
    };
  }

export interface OrderDetailed {
  id: string;
  userId: string;
  totalAmount: number;
  status: string
  paymentMethod: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Address snapshot
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };

  items: OrderItem[];
}


// eg attribute

// {
//   "color": "Red",
//   "size": "M",
//   etc
// }