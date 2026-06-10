import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Hitung tanggal awal dan akhir bulan ini
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0];

    const [totalStudents, rawStudents] = await Promise.all([
      prisma.student.count(),
      prisma.student.findMany({
        skip,
        take: limit,
        include: { 
          mentor: { select: { nama: true } },
          absensi: {
            where: {
              tanggal: { gte: firstDay, lte: lastDay },
              status: "Hadir"
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Map data untuk mengirimkan total_hadir_bulan_ini
    const students = rawStudents.map(student => ({
      ...student,
      total_hadir_bulan_ini: student.absensi.length,
      absensi: undefined // Hapus array aslinya agar hemat bandwidth
    }));

    return NextResponse.json({ 
      success: true, 
      students,
      pagination: {
        total: totalStudents,
        page,
        limit,
        totalPages: Math.ceil(totalStudents / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data siswa." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id_siswa, nama, nama_class, mentor_id } = await req.json();
    if (!id_siswa || !nama || !nama_class) {
      return NextResponse.json({ error: "Data wajib belum lengkap." }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        id_siswa,
        nama,
        nama_class,
        mentor_id: mentor_id || null
      }
    });

    return NextResponse.json({ success: true, student: newStudent });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan siswa." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id_siswa, mentor_id } = await req.json();
    if (!id_siswa) {
      return NextResponse.json({ error: "ID siswa dibutuhkan." }, { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id_siswa },
      data: { mentor_id: mentor_id || null }
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengupdate mentor." }, { status: 500 });
  }
}
