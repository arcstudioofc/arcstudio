import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = ["GET", "HEAD", "OPTIONS"];
const BLOCKED_USER_AGENTS = [/sqlmap/i, /nessus/i, /acunetix/i, /nikto/i, /curl/i, /wget/i];

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  if (!ALLOWED_METHODS.includes(req.method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  if (BLOCKED_USER_AGENTS.some((pattern) => pattern.test(ua))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (url.pathname.includes("..")) {
    return new NextResponse("Invalid Path", { status: 400 });
  }

  if (/[A-Za-z0-9._-]+\.(env|log|ini|db|sqlite|sql)$/i.test(url.pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }

}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
