import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout Berhasil",
  });

  // Hancurkan cookie
  response.cookies.delete("admin_token");

  return response;
}
