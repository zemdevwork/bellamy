
// import UserProfile from "@/components/profile/User-profile";
// import UserSettings from "@/components/settings/Settings";
// import OrderList from "@/components/orders/Order";

// export default function ProfilePage() {
//   return (
//     <div className="container mx-auto py-8 px-4 space-y-12">
//       {/* Profile Section */}
//       <section>
//         <h2 className="text-2xl font-bold mb-4">Profile</h2>
//         <UserProfile />
//       </section>

//       {/* Settings Section */}
//       <section>
//         <h2 className="text-2xl font-bold mb-4">Settings</h2>
//         <UserSettings />
//       </section>
//       <section>
//         <h2 className="min-h-screen bg-gray-50">
//               <OrderList />
//             </h2>
//       </section>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import UserProfile from "@/components/profile/User-profile";
import UserSettings from "@/components/settings/Settings";
import OrderList from "@/components/orders/Order";
import { User, Settings, ShoppingBag, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      component: <UserProfile />,
    },
    {
      id: "orders",
      label: "My Orders",
      icon: ShoppingBag,
      component: <OrderList />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: <UserSettings />,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile, orders, and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Navigation</h3>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 mb-2 ${
                        activeTab === tab.id
                          ? "bg-black text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            activeTab === tab.id ? "text-white" : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeTab === tab.id
                            ? "text-white rotate-90"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px]">
              {/* Content Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {activeTabData && (
                    <>
                      <activeTabData.icon className="w-6 h-6 text-gray-700" />
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeTabData.label}
                      </h2>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTabData && (
                  <div className="animate-fadeIn">{activeTabData.component}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}