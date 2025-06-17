"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSchema } from "../schema/userSchema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

export function SignUpPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof userSchema>) {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (response.ok) {
      router.push("/login");
    } else {
      console.error("Registration failed");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription>
                Let's get started. Fill in the details below to create your
                account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4"></div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          {/* <FormDescription>
                            This is your public display name.
                          </FormDescription> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          {/* <FormDescription>
                            This is your public display name.
                          </FormDescription> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          {/* <FormDescription>
                            This is your public display name.
                          </FormDescription> */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign up
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a href="/login" className="underline underline-offset-4">
                    Sign in
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </form>
    </Form>
  );
}
