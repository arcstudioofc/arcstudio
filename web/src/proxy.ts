import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/lib/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ALLOWED_METHODS = ["GET", "HEAD", "OPTIONS"];

const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nessus/i,
  /acunetix/i,
  /nikto/i,
  /curl/i,
  /wget/i,
];

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  if (!ALLOWED_METHODS.includes(req.method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(ua)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (url.pathname.includes("..")) {
    return new NextResponse("Invalid Path", { status: 400 });
  }

  if (/[A-Za-z0-9._-]+\.(env|log|ini|db|sqlite|sql)$/i.test(url.pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
