"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Mail, Phone, Edit2, Shield } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

export default function UserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
        setImageFile(null);
        toast.success("Profile updated!");
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
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
          <div className="text-center py-10">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <p className="mt-2">Loading profile...</p>
    </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
            <p className="text-gray-600">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Profile</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Manage your personal information</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={imagePreview} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Label htmlFor="image" className="cursor-pointer">
                          <div className="w-8 h-8 bg-white rounded-full shadow border flex items-center justify-center hover:bg-gray-50">
                            <Camera className="w-4 h-4 text-gray-600" />
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Fields */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updating}
                      className="flex-1"
                    >
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Avatar and Name */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.image} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <span className="inline-flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}