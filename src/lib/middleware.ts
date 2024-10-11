// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/../auth"; // Adjust the import path as necessary
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/index";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow API auth routes to pass through
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Retrieve the session
  const { user } = await auth(req);

  const isLoggedIn = !!user;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect authenticated users away from auth routes (e.g., login, register)
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/register", req.url));
  }

  // Proceed to the requested page
  return NextResponse.next();
}

// Matcher configuration
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
