"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, LucideEyeOff, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema } from "@/schema/user-schema"; 
import { UserFormData } from "@/types/user"; 
import { useRouter } from "next/navigation";

type CreateUserFormData = UserFormData;


export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsExecuting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.error || "Sign up failed");
      } else {
        router.replace(result.redirectTo || "/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-3 py-5 shadow-lg rounded-2xl">
        {/* Header */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                                             <Input
                         placeholder="John Doe"
                         className="bg-background"
                         {...field}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                                              <Input
                          placeholder="hello@example.com"
                          type="email"
                          className="bg-background"
                          {...field}
                        />
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
                    <Input
                        placeholder="+91"
                        type="tel"
                        autoComplete="tel"
                        disabled={isExecuting}
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                                                 <Input
                           placeholder="••••••••"
                           type={showPassword ? "text" : "password"}
                           className="bg-background pr-10"
                           {...field}
                         />
                         <button
                           type="button"
                           className="absolute right-3 top-1.5 text-muted-foreground"
                           onClick={() => setShowPassword(!showPassword)}
                         >
                          {showPassword ? <LucideEyeOff /> : <Eye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms */}
                             <p className="text-xs text-muted-foreground">
                 By continuing, you agree to our{" "}
                 <a href="#" className="text-red-500 hover:underline">
                   terms of service
                 </a>
                 .
               </p>

              {/* Error message */}
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        {/* Footer */}
        <CardFooter className="text-center">
                     <p className="text-sm text-muted-foreground w-full">
             Already have an account?{" "}
             <Link
               href="/login"
               className="text-red-500 hover:underline font-medium"
             >
               Sign in here
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
