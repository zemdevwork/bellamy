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

  // Fetch user profile
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

  // Password validation
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

  // Toggle password visibility
  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle password reset
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
      <div className="flex justify-center items-center w-full h-96">
        <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col justify-center items-center border border-slate-200">
          <BufferingLoader />
          <p className="text-slate-600 text-sm mt-4 text-center">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <FaUser className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Manage your profile and account settings
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <div className="text-slate-500 text-xs font-medium">
                Account Status
              </div>
              <div className="text-lg font-bold text-slate-900">Active</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <FaUserCircle className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-800">
                  Profile Information
                </h2>
              </div>

              {profile && (
                <div className="space-y-4">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-200">
                      {profile.image ? (
                        <Image
                          src={profile.image || fallBackImage}
                          width={96}
                          height={96}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="w-16 h-16 text-indigo-400" />
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-indigo-200 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <FaUser className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Full Name
                          </p>
                          <p className="text-slate-800 font-medium">
                            {profile.name || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-200 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Email Address
                          </p>
                          <p className="text-slate-800 font-medium">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-indigo-200 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <FaPhone className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Phone Number
                          </p>
                          <p className="text-slate-800 font-medium">
                            {profile.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <FaLock className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-800">Change Password</h2>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {showPasswords.current ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPasswords.new ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                {passwordData.newPassword && (
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <p className="text-xs font-medium text-indigo-800 mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      {['At least 8 characters', 'One number'].map((requirement) => {
                        const isValid = !passwordErrors.includes(requirement);
                        return (
                          <div key={requirement} className="flex items-center space-x-2">
                            {isValid ? (
                              <FaCheck className="w-3 h-3 text-green-500" />
                            ) : (
                              <FaTimes className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPasswords.confirm ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {passwordData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <>
                          <FaCheck className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={passwordLoading || !passwordValid || passwordData.newPassword !== passwordData.confirmPassword}
                  className="w-full px-6 py-3 text-sm font-medium bg-white text-indigo-700 border border-indigo-300 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      Updating Password...
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
      </div>
    </div>
  );
}

export default UserSettings;
