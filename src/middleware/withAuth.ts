import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

// Hanya Admin yang bisa mengakses halaman ini
const onlyAdminPage = ["/mesin", "/stasiun", "/user"];

// Halaman untuk autentikasi
const authPage = ["/login"];

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = [],
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;
    if (requireAuth.includes(pathname)) {
      // Mendapatkan token dari cookie
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Jika tidak ada token, redirect ke halaman login
      if (!token && !authPage.includes(pathname)) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }

      if (token) {
        // Jika ada token, redirect ke halaman utama
        if (authPage.includes(pathname)) {
          return NextResponse.redirect(new URL("/", req.url));
        }

        // Jika role bukan Admin, redirect ke halaman utama
        if (
          (token?.user_data as { role_name: string })?.role_name !== "Admin" &&
          onlyAdminPage.includes(pathname)
        ) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
    }

    return middleware(req, next);
  };
}
