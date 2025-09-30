"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Lock, Eye, EyeOff, Check, X, Shield } from "lucide-react";
import { toast } from "sonner";

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

export default function UserSettings() {
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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user-profile");
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
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
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordReset = async () => {
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
      const res = await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    );
  }

  const isPasswordValid =
    passwordErrors.length === 0 &&
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword;

  return (
      <div className="p-8 space-y-8 w-full">
        {/* Header */}
        <div className="w-full">
          <h2 className="text-2xl font-medium text-gray-900 mb-1">Settings</h2>
          <p className="text-gray-600 text-sm">
            Manage your account security and preferences
          </p>
        </div>

        {/* Profile Overview */}
        <div className="border rounded-lg p-6 w-full">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Account Information
            </h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{profile.name}</h4>
              <p className="text-sm text-gray-600 mt-0.5">{profile.email}</p>
              {profile.phone && (
                <p className="text-sm text-gray-600 mt-0.5">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="border rounded-lg p-6 w-full">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Change Password
            </h3>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border w-full">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Password Requirements:
                  </p>
                  <div className="space-y-1.5">
                    {["At least 8 characters", "One number"].map((req) => {
                      const isValid = !passwordErrors.includes(req);
                      return (
                        <div key={req} className="flex items-center gap-2">
                          {isValid ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-600" />
                          )}
                          <span
                            className={`text-xs ${
                              isValid ? "text-green-700" : "text-red-700"
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
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 pr-12"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {passwordData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2 w-full">
                  {passwordData.newPassword ===
                  passwordData.confirmPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs text-green-700">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-xs text-red-700">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 w-full">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={passwordLoading || !isPasswordValid}
                className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}