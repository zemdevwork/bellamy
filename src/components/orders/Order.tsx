
// "use client";
// import { useEffect, useState } from "react";

// type Order = {
//   id: string;
//   totalAmount: number;
//   status: string;
//   createdAt: string;
//   items: {
//     productId: string;
//     quantity: number;
//     price: number;
//     product?: { name: string; image?: string };
//   }[];
// };

// const StatusBadge = ({ status }: { status: string }) => {
//   const getStatusColor = (status: string) => {
//     switch (status.toUpperCase()) {
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'PROCESSING':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'SHIPPED':
//         return 'bg-purple-100 text-purple-800 border-purple-200';
//       case 'DELIVERED':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-800 border-red-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   return (
//     <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
//       {status.toUpperCase()}
//     </span>
//   );
// };

// const ProductImage = ({ src, alt, name }: { src?: string; alt: string; name: string }) => {
//   const [imageError, setImageError] = useState(false);

//   if (!src || imageError) {
//     return (
//       <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
//         <div className="text-gray-500 text-xs font-medium text-center">
//           {name.substring(0, 2).toUpperCase()}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <img
//       src={src}
//       alt={alt}
//       className="w-16 h-16 object-cover rounded-lg"
//       onError={() => setImageError(true)}
//     />
//   );
// };

// export default function OrderList() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await fetch("/api/orders");
//         const data = await res.json();
//         setOrders(Array.isArray(data) ? data : data.orders || []);
//       } catch (err) {
//         console.error("Failed to fetch orders", err);
//         setOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="animate-pulse space-y-4">
//           <div className="h-8 bg-gray-300 rounded w-1/4"></div>
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
//               <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
//               <div className="space-y-3">
//                 <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//                 <div className="h-4 bg-gray-300 rounded w-1/4"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
//         <div className="text-sm text-gray-500">
//           {orders.length} {orders.length === 1 ? 'order' : 'orders'}
//         </div>
//       </div>

//       {/* Orders List */}
//       {orders.length === 0 ? (
//         <div className="text-center py-12">
//           <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
//           <p className="text-gray-500">When you place your first order, it will appear here.</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div
//               key={order.id}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
//             >
//               {/* Order Header */}
//               <div className="px-6 py-4 border-b border-gray-100">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                   <div className="flex items-center gap-4">
//                     <div>
//                       <h3 className="font-semibold text-gray-900">
//                         Order #{order.id.slice(-8)}
//                       </h3>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Placed on {formatDate(order.createdAt)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <StatusBadge status={order.status} />
//                     <div className="text-right">
//                       <p className="text-lg font-bold text-gray-900">
//                         ₹{order.totalAmount.toFixed(2)}
//                       </p>
//                       <p className="text-sm text-gray-500">Total</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="px-6 py-4">
//                 <div className="space-y-3">
//                   {order.items.map((item, index) => (
//                     <div
//                       key={`${item.productId}-${index}`}
//                       className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
//                     >
//                       {/* Product Image */}
//                       <ProductImage
//                         src={item.product?.image}
//                         alt={item.product?.name || 'Product'}
//                         name={item.product?.name || 'Product'}
//                       />

//                       {/* Product Details */}
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-gray-900 truncate">
//                           {item.product?.name || 'Unknown Product'}
//                         </h4>
//                         <div className="flex items-center gap-4 mt-1">
//                           <span className="text-sm text-gray-500">
//                             Qty: {item.quantity}
//                           </span>
//                           <span className="text-sm font-medium text-gray-900">
//                             ₹{item.price.toFixed(2)} each
//                           </span>
//                         </div>
//                       </div>

//                       {/* Item Total */}
//                       <div className="text-right">
//                         <p className="font-semibold text-gray-900">
//                           ₹{(item.price * item.quantity).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Order Actions */}
//               <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
//                 <div className="flex items-center justify-between">
//                   <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
//                     View Details
//                   </button>
//                   <div className="flex gap-2">
//                     {order.status.toUpperCase() === 'DELIVERED' && (
//                       <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                         Reorder
//                       </button>
//                     )}
//                     {['PENDING', 'PROCESSING'].includes(order.status.toUpperCase()) && (
//                       <button className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
//                         Cancel Order
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    product?: { name: string; image?: string };
  }[];
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const ProductImage = ({
  src,
  alt,
  name,
}: {
  src?: string;
  alt: string;
  name: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-xs font-medium text-center">
          {name.substring(0, 2).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <div className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500">
            When you place your first order, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <ProductImage
                        src={item.product?.image}
                        alt={item.product?.name || "Product"}
                        name={item.product?.name || "Product"}
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product?.name || "Unknown Product"}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{item.price.toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    View Details
                  </button>
                  <div className="flex gap-2">
                    {order.status.toUpperCase() === "DELIVERED" && (
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Reorder
                      </button>
                    )}
                    {["PENDING", "PROCESSING"].includes(
                      order.status.toUpperCase()
                    ) && (
                      <button className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
