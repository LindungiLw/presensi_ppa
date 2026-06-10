import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    
    // Generate an array of the last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    // We will do 7 parallel queries for attendance, and 1 query for all users/students to build cumulative sums
    const [allMentors, allStudents] = await Promise.all([
      prisma.user.findMany({ where: { role: "MENTOR" }, select: { createdAt: true } }),
      prisma.student.findMany({ select: { createdAt: true } })
    ]);

    const mentorsTrend = dates.map(date => {
      return allMentors.filter(m => m.createdAt.toISOString().split("T")[0] <= date).length;
    });

    const studentsTrend = dates.map(date => {
      return allStudents.filter(s => s.createdAt.toISOString().split("T")[0] <= date).length;
    });

    // Attendance trend
    const attendancePromises = dates.map(date => 
      prisma.absensi.count({
        where: { tanggal: date, status: "Hadir" }
      })
    );
    const attendanceTrend = await Promise.all(attendancePromises);

    const mentors = mentorsTrend[6];
    const students = studentsTrend[6];
    const presentToday = attendanceTrend[6];

    return NextResponse.json({ 
      mentors, 
      students, 
      presentToday,
      mentorsTrend,
      studentsTrend,
      attendanceTrend
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil statistik." }, { status: 500 });
  }
}
