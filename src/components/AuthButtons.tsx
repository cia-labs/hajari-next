"use client";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton>
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton>
          <Button variant="destructive">Sign Out</Button>
        </SignOutButton>
      </SignedIn>
    </div>
  );
}