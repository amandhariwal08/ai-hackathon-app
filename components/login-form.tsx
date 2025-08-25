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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const loginFormSchema = z.object({
  email: z.email(),
  password: z.string(),
  // .min(8, "Password must be at least 8 characters long")
  // .max(20, "Password must not exceed 20 characters")
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
  // ),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isView, setIsView] = useState(false);
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    // Hash the password before using/sending it
    // const hashedPassword = await bcrypt.hash(values.password, 10); // 10 is the salt rounds

    try {
      const response = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (response?.error) {
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      console.log(error);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                Login
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
