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
//     } catch (_error) {
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
//     } catch (_error) {
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
import { Camera, Mail, Phone } from "lucide-react";
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
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">Loading...</CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">Failed to load profile</CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={imagePreview} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="image" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Camera className="w-4 h-4 mr-1" />
                            Photo
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updating}>
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}