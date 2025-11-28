"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignInPage from "./(auth)/sign-in/page";
import { Loader2 } from "lucide-react";

function UniversityRedirectingScreen() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-100 dark:border-gray-700">
      {/* <div className="flex items-center justify-center mb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">
            <span className="text-indigo-700 dark:text-indigo-400">A</span>
            <span className="text-green-500 dark:text-green-400">U</span>
          </div>
          <div className="h-px w-16 bg-gray-200 dark:bg-gray-600 my-2"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">ATTENDANCE SYSTEM</div>
        </div>
      </div> */}
      
      <div className="mb-8">
        <h2 className="text-lg font-medium text-center text-gray-800 dark:text-gray-200 mb-1">Preparing Your Dashboard</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">Please wait while we redirect you</p>
      </div>
      
      <div className="relative pt-1 mb-6">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
              Loading
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
              {progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100 dark:bg-gray-700">
          <div 
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 dark:bg-green-500 transition-all duration-300 ease-in-out"
          ></div>
        </div>
      </div>
      
      <div className="flex justify-center items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-500" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Redirecting to your portal...</span>
      </div>
    </div>

    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
      © {new Date().getFullYear()} AU Attendance System
    </div>
  </div>
);
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !userLoaded) return;

    if (!isSignedIn) {
      return;
    }

    const role = user?.publicMetadata?.role as string | undefined;
    if (role === "admin") router.replace("/admin");
    else if (role === "teacher") router.replace("/teacher");
    else if (role === "student") router.replace("/student");
    else router.replace("/sign-in");
  }, [isLoaded, userLoaded, isSignedIn, user, router]);

  if (!isSignedIn) {
    return <SignInPage />;
  }

  return <UniversityRedirectingScreen />;
}


