import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuth } from "./app/lib/jwt";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const path = req.nextUrl.pathname;

  const isSuperadminRoute = path.startsWith("/superadmin") || path.startsWith("/api/superadmin");
  const isMentorRoute = path.startsWith("/mentor") || path.startsWith("/api/mentor");

  if (!isSuperadminRoute && !isMentorRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const payload: any = await verifyAuth(token);

    if (isSuperadminRoute && payload.role !== "SUPERADMIN") {
      if (payload.role === "MENTOR") {
         return NextResponse.redirect(new URL("/mentor", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isMentorRoute && payload.role !== "MENTOR" && payload.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Pass the user info to headers so we can read it easily in API routes if needed
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/superadmin/:path*", 
    "/mentor/:path*",
    "/api/superadmin/:path*",
    "/api/mentor/:path*"
  ],
};
