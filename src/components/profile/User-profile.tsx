"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Mail, Phone, Edit2, User } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof updateProfileSchema>;

export default function UserProfileComponent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user-profile");
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        form.reset({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || "",
        });
        setImagePreview(data.data.image || "");
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (imageFile) formData.append("photoFile", imageFile);

      const res = await fetch("/api/user-profile", {
        method: "PATCH",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setUser(result.data);
        setIsEditing(false);
        setImageFile(null);
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Profile" width={96} height={96} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="image-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow border flex items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
            <input
              {...form.register("name")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Enter your name"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <input
              {...form.register("email")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Enter your email"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Phone (Optional)</label>
            <input
              {...form.register("phone")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setImageFile(null);
                form.reset();
              }}
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updating}
              className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-1">Profile Information</h2>
          <p className="text-gray-600 text-sm">Manage your personal details</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Profile Display */}
      <div className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-6 pb-6 border-b">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={80} height={80} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">{user.name}</h3>
            <p className="text-gray-600 text-sm mt-1">Member since {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="text-gray-900 font-medium">{user.phone || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}