"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSelectRole = async (role: "STUDENT" | "INSTRUCTOR") => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        // Force a page reload to update the auth session state context
        window.location.assign("/");
      } else {
        console.error("Failed to onboard user");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-muted/50">
      <div className="max-w-md w-full space-y-8 p-8 bg-card shadow-lg rounded-2xl border">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to LearnFlow!
          </h2>
          <p className="mt-4 text-muted-foreground">
            To get started, please tell us how you plan to use the platform.
          </p>
        </div>

        <div className="flex flex-col space-y-4 pt-4">
          <Button
            size="lg"
            className="w-full text-lg h-16 transition-all hover:scale-[1.02]"
            onClick={() => onSelectRole("STUDENT")}
            disabled={isLoading}
          >
            I am a Student
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg h-16 transition-all hover:scale-[1.02]"
            onClick={() => onSelectRole("INSTRUCTOR")}
            disabled={isLoading}
          >
            I am an Instructor
          </Button>
        </div>
      </div>
    </div>
  );
}
