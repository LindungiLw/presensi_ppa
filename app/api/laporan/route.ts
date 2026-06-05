import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Tangkap parameter filter waktu dari Frontend
    const date = searchParams.get("date"); // Untuk Pencarian Tabel Harian
    const startDate = searchParams.get("startDate"); // Mulai tanggal (Untuk Excel)
    const endDate = searchParams.get("endDate"); // Sampai tanggal (Untuk Excel)
    const isExport = searchParams.get("isExport") === "true"; // Penanda kalau ini request dari tombol Excel

    let whereClause: any = {};

    // 1. Jika minta data untuk 1 HARI SPESIFIK (Sangat Ringan)
    if (date) {
      whereClause.tanggal = date;
    }
    // 2. Jika minta data RENTANG WAKTU (Semesteran / Tahunan)
    else if (startDate && endDate) {
      whereClause.tanggal = {
        gte: startDate, // Lebih besar atau sama dengan Start
        lte: endDate, // Lebih kecil atau sama dengan End
      };
    }

    // 3. LOGIKA PEMBATAS CERDAS (SMART LIMIT)
    // Jika untuk Excel atau Harian, JANGAN DIBATASI (Ambil 100% data)!
    // Tapi jika ini tarikan bebas dari Dashboard (tanpa filter), batasi 3000 agar server aman.
    const shouldLimit = !date && !isExport && (!startDate || !endDate);

    // Tarik data dengan efisien dari Database
    const dataAbsen = await prisma.kehadiran.findMany({
      where: whereClause,
      orderBy: { waktu: "desc" },
      include: { anggota: true },
      ...(shouldLimit ? { take: 3000 } : {}), // Pasang rem darurat hanya jika perlu
    });

    const dataFormatted = dataAbsen.map((log: any) => ({
      id: log.id,
      id_anggota: log.id_anggota,
      nama: log.anggota?.nama || "Data Terhapus",
      role: log.anggota?.role || "unknown",
      jurusan: log.anggota?.jurusan || "-",
      batch: log.anggota?.batch || "-",
      sesi: log.sesi,
      waktu: log.waktu,
      tanggal: log.tanggal,
    }));

    return NextResponse.json({ success: true, data: dataFormatted });
  } catch (error) {
    console.error("Gagal menarik data laporan:", error);
    return NextResponse.json(
      { error: "Gagal menarik data dari database" },
      { status: 500 },
    );
  }
}
