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
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button className="hover:text-gray-900">Home</button>
          <span>/</span>
          <span className="page-title">My Account</span>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="page-title text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Horizontal Tabs */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="flex items-center justify-between border-b">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                        ? "text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span> {/* Hide on small screens */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                    )}
                  </button>

                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-2 px-6 py-4 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border overflow-hidden">
          {activeTabData?.component}
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={showLogoutDialog} setOpen={setShowLogoutDialog} />
    </div>
  );
}