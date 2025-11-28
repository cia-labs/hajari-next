"use client";

import { Toaster } from "sonner";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <>
      <Toaster position="bottom-right" richColors />


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#00d746]/5 dark:bg-[#00d746]/10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#4637d2]/5 dark:bg-[#4637d2]/10 translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-[#00d746]/5 dark:bg-[#00d746]/10"></div>
      </div>


      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f8f9fa] dark:bg-[#0e0f11] p-6 md:p-10 transition-colors duration-300">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <img
              src="/Atria_logo.svg"
              alt="Atria University"
              className="h-16 w-auto "
            />
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#4637d2]"></span>
              <span className="h-1 w-1 rounded-full bg-[#00d746]"></span>
              <span className="h-1 w-1 rounded-full bg-[#333742]"></span>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
