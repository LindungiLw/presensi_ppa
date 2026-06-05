import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

// Nilai Default sesuai settingan lama
const defaultSesi = [
  { nama_sesi: "Pagi", jam_mulai: "08:00", jam_selesai: "11:59" },
  { nama_sesi: "Siang", jam_mulai: "13:00", jam_selesai: "16:59" },
  { nama_sesi: "Malam", jam_mulai: "18:00", jam_selesai: "20:59" },
];

export async function GET() {
  try {
    let sesi = await prisma.pengaturanSesi.findMany({ orderBy: { id: "asc" } });

    // Cerdas: Jika tabel masih kosong, otomatis masukkan nilai default!
    if (sesi.length === 0) {
      await prisma.pengaturanSesi.createMany({ data: defaultSesi });
      sesi = await prisma.pengaturanSesi.findMany({ orderBy: { id: "asc" } });
    }

    return NextResponse.json({ success: true, data: sesi });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memuat pengaturan sesi" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json(); // Array berisi {id, jam_mulai, jam_selesai}

    // Simpan semua perubahan sekaligus menggunakan Transaction
    const updatePromises = payload.map((s: any) =>
      prisma.pengaturanSesi.update({
        where: { id: s.id },
        data: { jam_mulai: s.jam_mulai, jam_selesai: s.jam_selesai },
      }),
    );

    await prisma.$transaction(updatePromises);
    return NextResponse.json({
      success: true,
      message: "Jam operasional berhasil diperbarui!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 },
    );
  }
}
