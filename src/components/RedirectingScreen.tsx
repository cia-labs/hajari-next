import { Loader2 } from "lucide-react";

export default function RedirectingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] px-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#4f51a3]" />
        <div className="text-lg font-semibold text-[#333742]">Redirecting...</div>
        <div className="text-sm text-[#4f51a3]/70">Please wait while we set things up for you.</div>
      </div>
    </div>
  );
}
