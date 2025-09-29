"use client";

import { useState } from "react";
import UserProfile from "@/components/profile/User-profile";
import UserSettings from "@/components/settings/Settings";
import OrderList from "@/components/orders/Order";
import { LogoutDialog } from "@/components/auth/logout-modal";
import { User, Settings, ShoppingBag, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
      <div className="page-wrap">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button className="hover:text-gray-900">Home</button>
          <span>/</span>
          <span className="text-gray-400 font-serif">My Account</span>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="page-title text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border">
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                        activeTab === tab.id
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}

                {/* Logout Button */}
                <div className="pt-2 mt-2 border-t">
                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border">
              {activeTabData?.component}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={showLogoutDialog} setOpen={setShowLogoutDialog} />
    </div>
  );
}