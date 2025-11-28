import { AppSidebar } from "@/components/app-sidebar-admin";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { IndiaClock } from "@/components/india-clock";
import { ClerkUserAvatar } from "@/components/clerk-user-avatar";
import AbsenceNotification from "@/components/dashboard/AbsenceNotification";
import { Toaster } from "sonner";
import AdminRouteGuard from "@/components/route-guards/AdminRouteGuard";



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>

      <SidebarProvider>
        <AppSidebar />

        <Toaster position="bottom-right" richColors />

        <SidebarInset>
          <header className="relative flex h-10 items-center px-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />

              {/* small screen logo */}
              <Link href="/">
                <img
                  src="/Atria logo.svg"
                  alt="Logo"
                  className="h-8 md:hidden cursor-pointer"
                />
              </Link>

              <h2 className="text-lg font-semibold hidden sm:block">
                Admin Dashboard
              </h2>
            </div>

            {/* centered logo*/}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center">
              <Link href="/">
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
              <AbsenceNotification />
              {/* <ClerkUserAvatar /> */}
            </div>
          </header>

          <main className="p-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminRouteGuard>
  );
}
