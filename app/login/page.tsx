"use client";

import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        {/* <SignUpForm /> */}
      </div>
    </div>
  );
}
