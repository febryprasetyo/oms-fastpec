import { getCookie } from "cookies-next";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  unprotectedRoutes,
} from "@/routes";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const res = NextResponse.next();
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const cookie = getCookie("token", { res, req });
  const pathname = nextUrl.pathname.split("/")[1];

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (unprotectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (cookie) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (cookie === undefined) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
