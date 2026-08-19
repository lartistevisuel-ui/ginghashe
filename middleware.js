import { NextResponse } from "next/server";

// Protège la page d'administration : sans cookie valide -> redirection vers /admin/login
export function middleware(req) {
  const pw = process.env.ADMIN_PASSWORD;
  const cookie = req.cookies.get("admin_auth")?.value;

  if (pw && cookie && cookie === pw) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin"],
};
