import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const mentorId = req.headers.get("x-user-id");
    if (!mentorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam || new Date().toISOString().split("T")[0];

    // Fetch students assigned to this mentor, including target date's attendance if it exists
    const students = await prisma.student.findMany({
      where: { mentor_id: mentorId },
      include: {
        absensi: {
          where: { tanggal: targetDate },
          take: 1
        }
      },
      orderBy: { nama: "asc" }
    });

    return NextResponse.json({ success: true, students, targetDate });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data siswa bimbingan." }, { status: 500 });
  }
}
