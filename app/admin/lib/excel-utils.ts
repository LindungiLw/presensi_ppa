import * as XLSX from "xlsx";

export const generateCustomExcel = (data: any[], fileName: string) => {
  if (data.length === 0) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Deteksi kolom apa saja yang ada di data saat ini
  const keys = Object.keys(data[0]);

  // Atur lebar kolom dinamis sesuai nama kolomnya
  const colWidths = keys.map((key) => {
    if (key === "ID Anggota") return { wch: 15 };
    if (key === "Nama Lengkap") return { wch: 35 };
    if (key === "Role") return { wch: 15 };
    if (key === "Jurusan") return { wch: 25 };
    if (key === "Batch") return { wch: 10 };
    if (key === "Total Kehadiran") return { wch: 15 };
    return { wch: 20 }; // Lebar default jika ada kolom lain
  });

  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
