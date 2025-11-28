import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware({
  afterAuth(auth, req) {
    const { sessionClaims } = auth;
    const role = sessionClaims?.publicMetadata?.role;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    if (
      pathname === "/" ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/teacher") && role !== "teacher") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    '/api/(.*)',              
    '/((?!_next|sign-in|sign-up|favicon.ico).*)', 
  ],
};

