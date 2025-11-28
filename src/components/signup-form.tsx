"use client"

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
    const { signUp, isLoaded } = useSignUp()
    const router = useRouter()
    
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return
        
        try {
            await signUp.create({
                emailAddress: email,
                password,
            })
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
            await signUp.attemptEmailAddressVerification({ code: "000000" }) // skip email verify for now
            await signUp.authenticateWithRedirect()
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Sign up failed")
        }
    }
    
    const handleGoogle = async () => {
        if (!isLoaded) return
        await signUp.authenticateWithRedirect({ strategy: "oauth_google" })
    }
    
    return (
        <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-[#333742]">Create an account</h1>
                        <p className="text-[#333742]/70">Get started with AU Apps</p>
                    </div>
                    
                    <Button 
                        variant="outline" 
                        className="w-full border-[#4f51a3]/30 hover:border-[#4f51a3] hover:bg-[#4f51a3]/5 transition-colors" 
                        onClick={handleGoogle}
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                            <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                    
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#333742]/10">
                        <span className="relative z-10 bg-background px-2 text-[#333742]/70">
                            Or continue with email
                        </span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#333742]">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="border-[#333742]/20 focus:border-[#4f51a3] focus:ring-1 focus:ring-[#4f51a3]"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#333742]">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-[#333742]/20 focus:border-[#4f51a3] focus:ring-1 focus:ring-[#4f51a3]"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <Button 
                        type="submit" 
                        className="w-full bg-[#4f51a3] hover:bg-[#4f51a3]/90 text-white transition-colors"
                    >
                        Create Account
                    </Button>
                    
                    <div className="text-center text-sm text-[#333742]">
                        Already have an account?{" "}
                        <a href="/sign-in" className="text-[#4f51a3] hover:text-[#4f51a3]/80 underline underline-offset-4">
                            Sign in
                        </a>
                    </div>
                    
                    <div className="text-balance text-center text-xs text-[#333742]/70 [&_a]:text-[#4f51a3] [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-[#4f51a3]/80">
                        By signing up, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </div>
                </form>
                
                <div className="hidden md:block relative bg-[#f8f9fa]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4f51a3]/10 to-[#00d746]/10"></div>
                    <img
                        src="/AU.png"
                        alt="Sign Up Illustration"
                        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
                    />
                    <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
                        <h3 className="font-semibold text-[#333742]">Join Atria University</h3>
                        <p className="text-sm text-[#333742]/80">Access all university resources and applications in one place</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}