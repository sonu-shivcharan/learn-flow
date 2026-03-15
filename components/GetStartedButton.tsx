"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function GetStartedButton() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!isSignedIn) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/profile");
      const data = await res.json();

      if (!data.user) {
        // User is authenticated in Clerk but not yet in our DB
        router.push("/onboarding");
      } else {
        // Redirect based on role
        if (data.user.role === "INSTRUCTOR" || data.user.role === "ADMIN") {
          router.push("/teacher/courses");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      router.push("/dashboard"); // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="w-48 h-12 bg-zinc-100 animate-pulse rounded-full" />;

  if (isSignedIn) {
    return (
      <Button 
        size="lg" 
        className="w-48 text-lg rounded-full" 
        onClick={handleAction}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Go to Dashboard"}
      </Button>
    );
  }

  return (
    <SignInButton mode="modal" fallbackRedirectUrl="/onboarding">
      <Button size="lg" className="w-48 text-lg rounded-full">
        Get Started
      </Button>
    </SignInButton>
  );
}
