import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkToday = searchParams.get("today");

  // Logika khusus untuk Scanner UI mengecek apakah hari ini libur
  if (checkToday) {
    const dateWIB = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
    );
    const yyyy = dateWIB.getFullYear();
    const mm = String(dateWIB.getMonth() + 1).padStart(2, "0");
    const dd = String(dateWIB.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const libur = await prisma.hariLibur.findUnique({
      where: { tanggal: todayStr },
    });
    return NextResponse.json({
      isLibur: !!libur,
      keterangan: libur?.keterangan || "",
    });
  }

  // Tarik semua data libur untuk Admin Panel
  const allLibur = await prisma.hariLibur.findMany({
    orderBy: { tanggal: "asc" },
  });
  return NextResponse.json({ success: true, data: allLibur });
}

export async function POST(request: Request) {
  try {
    const { tanggal, keterangan } = await request.json();
    await prisma.hariLibur.create({ data: { tanggal, keterangan } });
    return NextResponse.json({
      success: true,
      message: "Hari libur berhasil diset!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Tanggal ini mungkin sudah diset libur sebelumnya." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await prisma.hariLibur.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}
