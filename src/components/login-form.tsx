"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ShineBorder from "@/components/ui/shine-border";

export function LoginForm() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Login failed");
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    toast.success("Redirecting to Google login... ");
    setTimeout(async () => {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
      });
    }, 1000);
  };

  return (
    <div className="z-10 flex flex-col gap-6">
      <Card className="border-0 shadow-lg dark:bg-[#1c1e22] dark:text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-[#333742] dark:text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-[#333742]/70 dark:text-white/60">
            Login to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <ShineBorder
                borderRadius={8.5}
                borderWidth={1}
                duration={3}
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full border-[#4f51a3]/30 hover:border-[#4f51a3] hover:bg-[#4f51a3]/5 transition-colors dark:bg-transparent dark:hover:bg-[#4f51a3]/10 dark:text-white"
                  onClick={handleGoogle}
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-4 w-4"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </ShineBorder>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#333742]/10 dark:after:border-white/10">
                <span className="relative z-10 bg-background px-2 text-[#333742]/70 dark:text-white/60">
                  Or continue with
                </span>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#333742] dark:text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="border-[#333742]/20 focus:border-[#4f51a3] focus:ring-1 focus:ring-[#4f51a3] dark:bg-[#2a2c30] dark:border-white/20 dark:focus:border-[#4f51a3] dark:focus:ring-[#4f51a3]"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-[#333742] dark:text-white">
                      Password
                    </Label>
                    <a
                      href="#"
                      className="ml-auto text-sm text-[#4f51a3] hover:text-[#4f51a3]/80 hover:underline underline-offset-4"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#333742]/20 focus:border-[#4f51a3] focus:ring-1 focus:ring-[#4f51a3] dark:bg-[#2a2c30] dark:border-white/20 dark:focus:border-[#4f51a3] dark:focus:ring-[#4f51a3]"
                  />
                </div>

                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-[#4f51a3] hover:bg-[#4f51a3]/90 text-white"
                >
                  Login
                </Button>
              </div>

              <div className="text-center text-sm text-[#333742]">
                Access is restricted. Please contact your administrator for
                account setup.
              </div>

              {/* <div className="text-center text-sm text-[#333742]">
                Don&apos;t have an account?{" "}
                <a
                  href="/sign-up"
                  className="text-[#4f51a3] hover:text-[#4f51a3]/80 underline underline-offset-4"
                >
                  Sign up
                </a>
              </div> */}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* <div className="text-balance text-center text-xs text-[#333742]/70 [&_a]:text-[#4f51a3] [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-[#4f51a3]/80">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
}
