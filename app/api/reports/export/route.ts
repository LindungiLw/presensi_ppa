import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import * as XLSX from "xlsx";
import { verifyAuth } from "@/app/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await verifyAuth(token) as { role: string; id: string };
    const role = payload.role;
    const mentorId = payload.id;

    // Get filters from query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reqMentorId = searchParams.get("mentorId");

    let students;

    let absensiFilter: any = true;
    if (startDate && endDate) {
      absensiFilter = { where: { tanggal: { gte: startDate, lte: endDate } } };
    } else if (startDate) {
      absensiFilter = { where: { tanggal: { gte: startDate } } };
    } else if (endDate) {
      absensiFilter = { where: { tanggal: { lte: endDate } } };
    }
    
    let mentorName = "Semua Mentor";
    
    if (role === "SUPERADMIN") {
      const filterOptions: any = {};
      if (reqMentorId && reqMentorId !== "all") {
        filterOptions.mentor_id = reqMentorId;
        const m = await prisma.user.findUnique({ where: { id: reqMentorId }, select: { nama: true } });
        if (m) mentorName = m.nama;
      }
      
      students = await prisma.student.findMany({
        where: filterOptions,
        include: {
          mentor: { select: { nama: true } },
          absensi: absensiFilter
        },
        orderBy: { nama: "asc" }
      });
    } else if (role === "MENTOR") {
      const m = await prisma.user.findUnique({ where: { id: mentorId }, select: { nama: true } });
      if (m) mentorName = m.nama;
      
      students = await prisma.student.findMany({
        where: { mentor_id: mentorId },
        include: { 
          mentor: { select: { nama: true } },
          absensi: absensiFilter 
        },
        orderBy: { nama: "asc" }
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Format data for Excel with custom layout
    const wsData: any[][] = [];

    // Title Row
    wsData.push(["Absensi PPA IO-0126 Delada Helefanikha", "", "", "", "", "", "", ""]);
    
    // Metadata Rows
    wsData.push(["Dari tanggal", startDate || "-", "", "Sampai Tanggal", "", endDate || "-", "", ""]);
    wsData.push(["Mentor", mentorName, "", "", "", "", "", ""]);
    
    // Empty row
    wsData.push([]);

    // Table Headers
    wsData.push([
      "ID Siswa", "Nama", "Kelas", "Mentor", "Total Hadir", "Total Alpa", "Total Izin", "Total Sakit"
    ]);

    // Table Data
    students.forEach(student => {
      const totalHadir = student.absensi.filter(a => a.status === "Hadir").length;
      const totalAlpa = student.absensi.filter(a => a.status === "Alpa").length;
      const totalIzin = student.absensi.filter(a => a.status === "Izin").length;
      const totalSakit = student.absensi.filter(a => a.status === "Sakit").length;

      wsData.push([
        student.id_siswa,
        student.nama,
        student.nama_class,
        student.mentor?.nama || "-",
        totalHadir,
        totalAlpa,
        totalIzin,
        totalSakit
      ]);
    });

    // Signature Area
    const currentYear = new Date().getFullYear();
    wsData.push([]); // Empty row
    wsData.push(["", "", "", "", "", "", `, ${currentYear}`, ""]);
    wsData.push(["", "", "", "", "", "", "Mentor", ""]);
    wsData.push([]);
    wsData.push([]);
    wsData.push([]);
    wsData.push(["", "", "", "", "", "", mentorName, ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Apply Merges
    const dataLen = students.length;
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Title: A1:H1
      { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } }, // Start Date Value: B2:C2
      { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } }, // "Sampai Tanggal": D2:E2
      { s: { r: 1, c: 5 }, e: { r: 1, c: 7 } }, // End Date Value: F2:H2
      { s: { r: 2, c: 1 }, e: { r: 2, c: 7 } }, // Mentor Value: B3:H3
      { s: { r: dataLen + 6, c: 6 }, e: { r: dataLen + 6, c: 7 } }, // Signature Date
      { s: { r: dataLen + 7, c: 6 }, e: { r: dataLen + 7, c: 7 } }, // Signature Title
      { s: { r: dataLen + 11, c: 6 }, e: { r: dataLen + 11, c: 7 } }, // Signature Name
    ];

    // Apply Column Widths
    worksheet["!cols"] = [
      { wch: 15 }, // A (ID Siswa / Dari tanggal)
      { wch: 25 }, // B (Nama / Val)
      { wch: 15 }, // C (Kelas)
      { wch: 20 }, // D (Mentor / Sampai Tanggal)
      { wch: 12 }, // E (Hadir)
      { wch: 12 }, // F (Alpa)
      { wch: 12 }, // G (Izin)
      { wch: 12 }, // H (Sakit)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    let filename = "Rekap_Absensi_PPA";
    if (startDate && endDate) filename += `_${startDate}_sampai_${endDate}`;
    else if (startDate) filename += `_mulai_${startDate}`;
    else if (endDate) filename += `_sampai_${endDate}`;
    else filename += `_All_Time`;

    if (reqMentorId && reqMentorId !== "all" && role === "SUPERADMIN") {
      filename += `_Mentor_${reqMentorId}`;
    }

    filename += ".xlsx";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Gagal mengekspor laporan." }, { status: 500 });
  }
}
