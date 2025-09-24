"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import {
  getUserProfile,
  resetPassword,
} from "@/server/actions/user-settings-action";
import BufferingLoader from "@/components/ui/spinner";
import { toast } from "sonner";
import { fallBackImage } from "@/constants/values";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  role: string;
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await getUserProfile();
        if (result.success) {
          setProfile(result.profile);
        }
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/\d/.test(password)) errors.push("One number");
    return errors;
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));

    if (field === "newPassword") {
      setPasswordErrors(validatePassword(value));
    }

    if (value.length >= 8 && /\d/.test(value)) {
      setPasswordValid(true);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error("Please meet all password requirements");
      return;
    }

    try {
      setPasswordLoading(true);
      const result = await resetPassword({
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error("Failed to update password");
      console.error("Password update error:", error);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <BufferingLoader />
          <p className="text-gray-600 text-sm mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaUserCircle className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Profile Information</h2>
          </div>

          {profile && (
            <div className="space-y-4">
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  {profile.image ? (
                    <Image
                      src={profile.image || fallBackImage}
                      width={80}
                      height={80}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Full Name</p>
                    <p className="font-medium">{profile.name || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded">
                  <FaEnvelope className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded">
                  <FaPhone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Phone</p>
                    <p className="font-medium">{profile.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaLock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {passwordData.newPassword && (
              <div className="bg-gray-50 rounded p-3 border">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password Requirements:
                </p>
                <div className="space-y-1">
                  {["At least 8 characters", "One number"].map((req) => {
                    const isValid = !passwordErrors.includes(req);
                    return (
                      <div key={req} className="flex items-center gap-2">
                        {isValid ? (
                          <FaCheck className="w-3 h-3 text-green-500" />
                        ) : (
                          <FaTimes className="w-3 h-3 text-red-500" />
                        )}
                        <span
                          className={`text-xs ${
                            isValid ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {req}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {passwordData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <>
                      <FaCheck className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                passwordLoading ||
                !passwordValid ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaLock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;