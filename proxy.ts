import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Fungsi Proxy Next.js 16.2+
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("admin_token")?.value;

  const isAuthPage = path === "/login";
  const isAdminRoute = path.startsWith("/admin");
  const isApiRoute = path.startsWith("/api/");

  // =========================================================
  // JALUR VIP (Boleh diakses TANPA Login)
  // Mesin Scanner butuh absensi & cek libur, dan Admin butuh login.
  // =========================================================
  const isPublicApi =
    path === "/api/auth/login" ||
    path === "/api/absensi" ||
    (path === "/api/libur" && request.method === "GET"); // Cek libur boleh, tapi tambah/hapus libur harus Admin

  const isProtectedApi = isApiRoute && !isPublicApi;

  // =========================================================
  // PROSES VERIFIKASI JWT MENGGUNAKAN SECRET DARI .ENV
  // =========================================================
  let isVerified = false;
  if (token) {
    try {
      // Ambil kunci rahasia dari .env untuk memverifikasi token
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, SECRET_KEY);
      isVerified = true;
    } catch (error) {
      isVerified = false;
    }
  }

  // SKENARIO 1: Mencoba masuk /admin tapi token tidak ada atau tidak valid
  if (isAdminRoute && !isVerified) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔥 SKENARIO 2 (BARU): Akses API Admin tanpa Token Valid
  // Mencegah Hacker yang menggunakan aplikasi Postman/Insomnia
  if (isProtectedApi && !isVerified) {
    return NextResponse.json(
      { error: "Akses Ditolak: Anda tidak memiliki izin Admin." },
      { status: 401 }, // 401 Unauthorized
    );
  }

  // SKENARIO 3: Sudah login (token valid), tapi iseng buka halaman /login lagi
  if (isAuthPage && isVerified) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Lolos pemeriksaan, silakan lewat
  return NextResponse.next();
}

export const config = {
  // 🔥 PASTIKAN /api/ MASUK KE DALAM MATCHER AGAR DIPANTAU OLEH PROXY
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
