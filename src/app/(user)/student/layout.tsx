"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import StudentRouteGuard from "@/components/route-guards/StudentRouteGuard";
import { AppSidebarStudent } from "@/components/app-sidebar-student";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { IndiaClock } from "@/components/india-clock";
import AttendanceExceptionRequestButton from "../student/attendance-exceptions/page";
import { ClerkUserAvatar } from "@/components/clerk-user-avatar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <StudentRouteGuard>
      <SidebarProvider>
        <AppSidebarStudent />

        <SidebarInset>
          <header className="relative flex h-10 items-center px-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Link href="/student">
                <img
                  src="/Atria logo.svg"
                  alt="Logo"
                  className="h-8 md:hidden cursor-pointer"
                />
              </Link>
              <h2 className="text-lg font-semibold hidden sm:block">
                Student Dashboard
              </h2>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center">
              <Link href="/student">
                <img
                  src="/Atria logo.svg"
                  alt="Logo"
                  className="h-8 cursor-pointer"
                />
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center relative left-7">
                <IndiaClock />
              </div>
              <div className="flex items-center relative left-7">
                <ThemeToggle />
              </div>
              <div className="h-10 flex items-center mt-[30px] z-50 left-4 relative">
                <AttendanceExceptionRequestButton />
              </div>
              {/* <ClerkUserAvatar /> */}
            </div>
          </header>

          <main className="-mt-3">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </StudentRouteGuard>
  );
}
