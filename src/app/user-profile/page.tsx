"use client";

import { useState } from "react";
import UserProfile from "@/components/profile/User-profile";
import UserSettings from "@/components/settings/Settings";
import OrderList from "@/components/orders/Order";
import { User, Settings, ShoppingBag } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your profile, orders, and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border">
              {/* Content Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  {activeTabData && (
                    <>
                      <activeTabData.icon className="w-6 h-6 text-gray-700" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeTabData.label}
                      </h2>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {activeTabData?.component}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}