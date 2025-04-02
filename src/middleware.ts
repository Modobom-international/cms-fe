import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/configs/route.config";
import { UserRoleEnum } from "@/enums/user-role";
import {
  canAccessPath,
  getCurrentUser,
  getRoleRedirect,
} from "@/server/actions/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { nextUrl } = request;

  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value || "";

  // Check if user is authenticated
  const user = await getCurrentUser(accessToken);
  const isLoggedIn = !!user;

  const isApiAuthRoute = apiAuthPrefix.some((prefix) =>
    nextUrl.pathname.startsWith(prefix)
  );
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Check route access based on user role if user is logged in
  if (isLoggedIn && user?.role) {
    const hasAccess = canAccessPath(pathname, user.type_user);
    if (!hasAccess) {
      // Redirect to appropriate page based on role
      return NextResponse.redirect(
        new URL(getRoleRedirect(user.role as UserRoleEnum), nextUrl)
      );
    }
  }

  // Handle API authentication routes
  if (isApiAuthRoute) {
    return null;
  }

  // Handle auth routes (login, register, etc.)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  // Handle protected routes - user is not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    // Prevent infinite redirect loops by checking if we're already on a login page
    if (pathname.startsWith("/auth/login")) {
      return null;
    }

    // Store only the original requested URL as the callback, not the login URL itself
    const callbackUrl = pathname;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return null;
}

export const config = {
  matcher: [
    // Exclude files, _next, telescope, and horizon
    "/((?!.+\\.[\\w]+$|_next|telescope/requests|horizon/).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
