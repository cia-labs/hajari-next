"use client";

import { ReactNode, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

export default function StudentRouteGuard({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const role = user?.publicMetadata.role as string | undefined;
    if (role !== "student") {
      router.push("/forbidden");
    }
  }, [isLoaded, userId, user, router]);

  if (!isLoaded || !userId || user?.publicMetadata.role !== "student") {
    return null;
  }

  return <>{children}</>;
}
