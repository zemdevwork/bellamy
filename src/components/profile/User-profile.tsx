
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Camera, Mail, Phone } from "lucide-react";
// import { toast } from "sonner";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   image?: string;
// }

// const updateProfileSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   email: z.string().email("Invalid email"),
//   phone: z.string().optional(),
// });

// type FormData = z.infer<typeof updateProfileSchema>;

// export default function UserProfile() {
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState("");

//   const form = useForm<FormData>({
//     resolver: zodResolver(updateProfileSchema),
//     defaultValues: { name: "", email: "", phone: "" },
//   });

//   // ✅ Fetch profile
//   const fetchProfile = useCallback(async () => {
//     try {
//       const res = await fetch("/api/user-profile");
//       const data = await res.json();
//       if (data.success) {
//         setUser(data.data);
//         form.reset({
//           name: data.data.name,
//           email: data.data.email,
//           phone: data.data.phone || "",
//         });
//         setImagePreview(data.data.image || "");
//       } else {
//         toast.error("Failed to load profile");
//       }
//     } catch (error) {
//       console.error("Profile fetch error:", error);
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   }, [form]);

//   useEffect(() => {
//     fetchProfile();
//   }, [fetchProfile]);

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const onSubmit = async (data: FormData) => {
//     setUpdating(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", data.name);
//       formData.append("email", data.email);
//       if (data.phone) formData.append("phone", data.phone);
//       if (imageFile) formData.append("photoFile", imageFile);

//       const res = await fetch("/api/user-profile", {
//         method: "PATCH",
//         body: formData,
//       });

//       const result = await res.json();
//       if (result.success) {
//         setUser(result.data);
//         setIsOpen(false);
//         setImageFile(null);
//         toast.success("Profile updated!");
//       } else {
//         toast.error(result.error);
//       }
//     } catch (error) {
//       console.error("Profile update error:", error);
//       toast.error("Update failed");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Card className="max-w-md mx-auto">
//         <CardContent className="p-6 text-center">Loading...</CardContent>
//       </Card>
//     );
//   }

//   if (!user) {
//     return (
//       <Card className="max-w-md mx-auto">
//         <CardContent className="p-6 text-center">Failed to load profile</CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="max-w-md mx-auto">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <CardTitle>Profile</CardTitle>
//           <Dialog open={isOpen} onOpenChange={setIsOpen}>
//             <DialogTrigger asChild>
//               <Button size="sm">Edit</Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Profile</DialogTitle>
//               </DialogHeader>
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                   <div className="flex flex-col items-center space-y-2">
//                     <Avatar className="w-16 h-16">
//                       <AvatarImage src={imagePreview} />
//                       <AvatarFallback>{user.name[0]}</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <Input
//                         id="image"
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         className="hidden"
//                       />
//                       <Label htmlFor="image" className="cursor-pointer">
//                         <Button type="button" variant="outline" size="sm" asChild>
//                           <span>
//                             <Camera className="w-4 h-4 mr-1" />
//                             Photo
//                           </span>
//                         </Button>
//                       </Label>
//                     </div>
//                   </div>

//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Name</FormLabel>
//                         <FormControl>
//                           <Input {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="phone"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Phone</FormLabel>
//                         <FormControl>
//                           <Input {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="flex gap-2">
//                     <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button type="submit" disabled={updating}>
//                       {updating ? "Saving..." : "Save"}
//                     </Button>
//                   </div>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         <div className="flex items-center space-x-3">
//           <Avatar className="w-12 h-12">
//             <AvatarImage src={user.image} />
//             <AvatarFallback>{user.name[0]}</AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-medium">{user.name}</h3>
//             <p className="text-sm text-muted-foreground">{user.email}</p>
//           </div>
//         </div>

//         <div className="space-y-2">
//           <div className="flex items-center gap-2">
//             <Mail className="w-4 h-4 text-muted-foreground" />
//             <span className="text-sm">{user.email}</span>
//           </div>
//           {user.phone && (
//             <div className="flex items-center gap-2">
//               <Phone className="w-4 h-4 text-muted-foreground" />
//               <span className="text-sm">{user.phone}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
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

  // ✅ Fetch profile
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
      <div className="w-full max-w-4xl mx-auto">
        <Card className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <CardContent className="p-8">
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                <p className="text-gray-600 font-medium">Loading your profile...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-xl bg-gradient-to-br from-red-50 via-white to-orange-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load profile
            </h3>
            <p className="text-gray-600">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            My Profile
          </CardTitle>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </CardHeader>

        <CardContent className="p-8 pt-6">
          {/* Edit Profile Button */}
          <div className="flex justify-end mb-8">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                  size="lg"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Edit Profile
                  </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-2xl">
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                          <AvatarImage src={imagePreview} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                            {user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Label htmlFor="image" className="cursor-pointer">
                            <div className="w-10 h-10 bg-white rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                              <Camera className="w-4 h-4 text-gray-600" />
                            </div>
                          </Label>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Click the camera icon to update your photo
                      </p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="h-12 rounded-xl border-gray-200" />
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
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="h-12 rounded-xl border-gray-200" />
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
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input {...field} className="h-12 rounded-xl border-gray-200" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 h-12 rounded-xl border-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updating}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                      >
                        {updating ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Profile Display */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm">
              <CardContent className="flex flex-col items-center md:items-start space-y-6 p-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 ring-4 ring-white shadow-2xl">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-4xl font-bold">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
                  
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active Account
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right */}
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email Address</p>
                      <p className="text-gray-900 font-medium break-all">{user.email}</p>
                    </div>
                  </div>

                  {user.phone ? (
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone Number</p>
                        <p className="text-gray-900 font-medium">{user.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone Number</p>
                        <p className="text-gray-500 italic">Not provided</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
