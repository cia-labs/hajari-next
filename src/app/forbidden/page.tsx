"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

// const auTheme = {
//   primary: "#4637d2", 
//   secondary: "#00d746", 
//   white: "#ffffff",
// };

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-[#4637d2]/5 dark:from-[#1a1a1a] dark:to-[#1a1a1a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#00d746]/5 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#4637d2]/5 translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-[#00d746]/5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 py-12 mx-auto space-y-8 text-center">
        <div className="mb-4 w-75 h-30 px-10 relative">
          <Image
            src="/Atria_logo.svg"
            alt="Atria Logo"
            fill
            className="object-contain"
          />
        </div>

        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-[#00d746]/20 dark:bg-[#1e1f24] dark:border-[#00d746]/30">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-[#4637d2]/10 dark:bg-[#4637d2]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4637d2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#4637d2] to-[#00d746] bg-clip-text text-transparent">
            Access Denied
          </h1>

          <div className="h-1 w-16 mx-auto mb-6 bg-gradient-to-r from-[#4637d2] to-[#00d746]"></div>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You do not have permission to access this page.
            If you believe this is an error, please contact your administrator for assistance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-[#4637d2] hover:bg-[#4637d2]/90 text-white"
            >
              Return Home
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-[#00d746] text-[#00d746] hover:bg-[#00d746]/10"
            >
              Go Back
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          AU Attendance System
        </p>
      </div>
    </div>
  );
}
