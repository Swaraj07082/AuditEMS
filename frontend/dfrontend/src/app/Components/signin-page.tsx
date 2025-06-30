"use client";

import type React from "react";
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
import type { z } from "zod";
import { loginSchema } from "../schema/login-schema";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ThemeToggle } from "./theme-toggle";
import { useSearchParams } from "next/navigation";
import LoggedIn from "./logged-in";

export function SigninPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data: session, status } = useSession();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const signindata = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: true,
      callbackUrl: "/dashboard",
    });
    console.log(signindata);
  }

  if (status == "unauthenticated") {
    return (
      <div className="flex justify-center mt-4">
        <ThemeToggle />

        <div className={cn("w-full max-w-md", className)} {...props}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border shadow-lg">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold">
                    Welcome Back
                  </CardTitle>
                  <CardDescription>
                    Please log in to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    {"Don't have an account? "}
                    <a
                      href="/signup"
                      className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                      Sign up
                    </a>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-xs text-muted-foreground">
                By clicking continue, you agree to our{" "}
                <a
                  href="#"
                  className="underline hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <LoggedIn />
      </>
    );
  }
}
