"use client";
import { useUser } from "@clerk/nextjs";

export default function UserGreeting() {
  const { user } = useUser();

  return (
    <p className="text-muted-foreground text-sm">
      Hello, {user?.firstName} ({user?.publicMetadata?.role})
    </p>
  );
}