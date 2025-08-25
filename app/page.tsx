"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (session) {
      router.replace("/column-schemas"); // Redirect to desktop if logged in
    } else {
      router.replace("/login"); // Redirect to login if not logged in
    }
  }, [session, status, router]);

  // Optionally, show a loading spinner while redirecting
  return (
    <div className="h-screen w-full flex justify-center items-center">
      Loading...
    </div>
  );
}
