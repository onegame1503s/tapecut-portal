import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET_KEY || "tapecut-super-secret-fallback-key-change-in-prod";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /portal routes. Skip the login page itself.
  if (!pathname.startsWith('/portal') || pathname === '/portal/login') {
    return NextResponse.next();
  }

  // Grab the invisible wristband (JWT)
  const sessionCookie = req.cookies.get('tapecut_portal_session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/portal/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, { algorithms: ["HS256"] });
    
    // RBAC: Trap unapproved users in the Pending Gate
    if (payload.status === "pending_approval" && pathname !== '/portal/pending') {
      return NextResponse.redirect(new URL('/portal/pending', req.url));
    }

    // RBAC: Keep roles isolated
    if (payload.status === "approved") {
      if (pathname === '/portal/pending') {
        const redirectPath = payload.role === "admin" ? "/portal/admin" : "/portal/sales";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      if (pathname.startsWith('/portal/admin') && payload.role !== "admin") {
        return NextResponse.redirect(new URL('/portal/sales', req.url));
      }
      if (pathname.startsWith('/portal/sales') && payload.role !== "sales") {
        return NextResponse.redirect(new URL('/portal/admin', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If the token is fake, expired, or tampered with, wipe it and kick them out
    const response = NextResponse.redirect(new URL('/portal/login', req.url));
    response.cookies.delete('tapecut_portal_session');
    return response;
  }
}

export const config = {
  matcher: ['/portal/:path*'],
};  