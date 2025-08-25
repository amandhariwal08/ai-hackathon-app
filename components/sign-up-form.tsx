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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

const signUpFormSchema = z.object({
  firstName: z
    .string()
    .min(3, {
      message: "First Name must be at least 3 characters.",
    })
    .max(30),
  lastName: z
    .string()
    .min(3, {
      message: "Last Name must be at least 3 characters.",
    })
    .max(30),
  email: z.email(),
  password: z.string(),
  // .min(8, "Password must be at least 8 characters long")
  // .max(20, "Password must not exceed 20 characters")
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
  // ),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isView, setIsView] = useState(false);
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpFormSchema>) {
    // Hash the password before using/sending it
    // const hashedPassword = await bcrypt.hash(values.password, 10); // 10 is the salt rounds
    const payload = {
      user_firstname: values.firstName,
      user_lastname: values.lastName,
      user_email: values.email,
      user_password: values.password,
    };

    try {
      const response = await fetch("https://schema-sync.onrender.com/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // const response = await signIn("credentials", {
      //   ...payload,
      //   redirect: false,
      // });

      // if (!response.ok) {
      //   // Handle error
      //   const errorData = await response.json();
      //   // alert("Sign up failed: " + errorData.message);
      //   return;
      // }

      if (response.ok) {
        const response = await signIn("credentials", {
          email: values.email,
          password: values.password,
          callbackUrl: "/",
        });
        if (response?.error) {
          console.error(response.error);
        }
      } else {
        // Redirect or show success
        // window.location.href = "/";
      }

      // 4. Handle success (redirect, show message, etc.)
      // alert("Sign up successful!");
      // Optionally redirect to login or home
    } catch {
      // alert("An error occurred: " + error.message);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Enter details below to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="First Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Last Name" />
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
                      <Input {...field} placeholder="Email" />
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
                      <div className="relative">
                        <Input
                          type={isView ? "text" : "password"}
                          {...field}
                          placeholder="Password"
                          className="pr-12"
                        />
                        {isView ? (
                          <Eye
                            size={20}
                            className="absolute right-4 top-2 z-10 cursor-pointer text-gray-500"
                            onClick={() => {
                              setIsView(!isView);
                            }}
                          />
                        ) : (
                          <EyeOff
                            size={20}
                            className="absolute right-4 top-2 z-10 cursor-pointer text-gray-500"
                            onClick={() => setIsView(!isView)}
                          />
                        )}{" "}
                      </div>
                    </FormControl>
                    {/* <FormDescription></FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
