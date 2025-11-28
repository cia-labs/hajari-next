import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { AppSidebarTeacher } from "@/components/app-sidebar-teacher";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { IndiaClock } from "@/components/india-clock";
import { ClerkUserAvatar } from "@/components/clerk-user-avatar";
import TeacherRouteGuard from "@/components/route-guards/TeacherRouteGuard";

// import AbsenceNotification from "@/components/dashboard/AbsenceNotification";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeacherRouteGuard>
      <ClerkProvider>
        <SignedIn>
          <SidebarProvider>
            <AppSidebarTeacher variant="teacher" />

            <SidebarInset>
              <header className="relative flex h-10 items-center px-4 border-b bg-background">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />

                  <Link href="/teacher">
                    <img
                      src="/Atria logo.svg"
                      alt="Logo"
                      className="h-8 md:hidden cursor-pointer"
                    />
                  </Link>

                  <h2 className="text-lg font-semibold hidden sm:block">
                    Teacher Dashboard
                  </h2>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center">
                  <Link href="/teacher">
                    <img
                      src="/Atria logo.svg"
                      alt="Logo"
                      className="h-8 cursor-pointer"
                    />
                  </Link>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <IndiaClock />
                  <ThemeToggle />
                  {/* <AbsenceNotification /> */}
                  {/* <ClerkUserAvatar /> */}
                </div>
              </header>

              <main className="p-2 bg-muted/10 overflow-auto">{children}</main>
            </SidebarInset>

            <Toaster position="bottom-right" richColors />
          </SidebarProvider>
        </SignedIn>
      </ClerkProvider>
    </TeacherRouteGuard>
  );
}
