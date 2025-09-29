"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { userFormSchema } from "@/schema/user-schema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LucideEyeOff, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserFormData } from "@/types/user";
import { IconLogout } from "@tabler/icons-react";
import Link from "next/link";

type CreateUserFormData = UserFormData;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        localStorage.setItem('user', JSON.stringify(result.user));
        router.replace("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="w-[400px]" >
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <IconLogout />
          </div>
          <CardTitle className="font-serif font-normal">Create your account</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Name</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white"
                          placeholder="John Doe"
                          {...field}
                        />
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
                      <FormLabel className="text-white">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white"
                          placeholder="hello@example.com"
                          type="email"
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
                      <FormLabel className="text-white">Phone</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-white"
                          placeholder="+91"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="bg-white pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
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

                <p className="text-xs text-gray-400">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-blue-400 hover:underline">
                    terms of service
                  </a>
                  .
                </p>

                {errorMessage && (
                  <div className="text-sm font-medium text-red-500">
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isExecuting}>
                  {isExecuting ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Sign up"
                  )}
                </Button>
                <hr className="my-4" />
                <p className="text-sm text-center text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </p>
                {/* ✅ Go Home link added here */}
                <p className="text-sm text-center text-gray-600">
                  <Link href="/" className="text-blue-600 hover:underline">
                    Go Home
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}