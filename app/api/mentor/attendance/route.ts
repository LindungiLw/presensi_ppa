import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const mentorId = req.headers.get("x-user-id");
    if (!mentorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const targetDate = payload.date || new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5); // HH:mm

    if (payload.updates && Array.isArray(payload.updates)) {
      // Bulk Upsert Logic
      const transactions = payload.updates.map((update: any) => 
        prisma.absensi.upsert({
          where: {
            id_siswa_tanggal: {
              id_siswa: update.id_siswa,
              tanggal: targetDate
            }
          },
          update: {
            status: update.status,
            waktu: currentTime
          },
          create: {
            id_siswa: update.id_siswa,
            tanggal: targetDate,
            waktu: currentTime,
            status: update.status
          }
        })
      );
      
      await prisma.$transaction(transactions);
      return NextResponse.json({ success: true, count: payload.updates.length });
    } else {
      return NextResponse.json({ error: "Format payload tidak valid. Membutuhkan 'updates'." }, { status: 400 });
    }
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan absensi." }, { status: 500 });
  }
}
