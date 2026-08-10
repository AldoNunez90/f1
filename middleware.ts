// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Verificamos si existe la cookie de sesión de Auth.js
  const sessionToken = 
    request.cookies.get("authjs.session-token")?.value || 
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const { pathname } = request.nextUrl;

  // Si intenta entrar a /prode o /perfil sin la cookie, lo redirigimos al login
  if (!sessionToken && (pathname.startsWith("/prode") || pathname.startsWith("/perfil"))) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/prode/:path*", "/perfil/:path*"],
};