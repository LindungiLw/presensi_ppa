import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: { 
        id: true, 
        nama: true, 
        email: true, 
        createdAt: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, mentors });
  } catch (error) {
    console.error("GET Mentors Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data mentor." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nama, email, password } = await req.json();
    if (!nama || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: "MENTOR",
      }
    });

    return NextResponse.json({ success: true, mentor: { id: mentor.id, nama: mentor.nama, email: mentor.email } });
  } catch (error) {
    console.error("POST Mentor Error:", error);
    return NextResponse.json({ error: "Gagal menambahkan mentor." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { mentorId, newPassword } = await req.json();
    if (!mentorId || !newPassword) {
      return NextResponse.json({ error: "ID Mentor dan password baru wajib diisi." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: mentorId },
      data: {
        password: hashedPassword,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Mentor Error:", error);
    return NextResponse.json({ error: "Gagal mereset password mentor." }, { status: 500 });
  }
}
