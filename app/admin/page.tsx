"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardUtama() {
  const [chartData1W, setChartData1W] = useState<any[]>([]);
  const [chartData1M, setChartData1M] = useState<any[]>([]);
  const [chartData6M, setChartData6M] = useState<any[]>([]);

  const [totalHadir, setTotalHadir] = useState(0);
  const [hadirMahasiswa, setHadirMahasiswa] = useState(0);
  const [hadirStaff, setHadirStaff] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Jeda 50ms agar CSS Grid selesai digambar browser (mencegah bug Recharts)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Tentukan Rentang Waktu (Hari ini mundur 180 hari / 6 bulan)
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(today.getDate() - 180);

      const formatDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      const todayStr = formatDate(today);
      const startStr = formatDate(sixMonthsAgo);

      // 2. Tarik data dari API Pintar HANYA untuk 6 bulan terakhir
      // Menggunakan isExport=true agar limit 3000 diabaikan (karena 6 bulan bisa lebih dari 3000 data)
      const res = await fetch(
        `/api/laporan?startDate=${startStr}&endDate=${todayStr}&isExport=true`,
      );
      const json = await res.json();

      if (json.success) {
        const rawData = json.data;

        // 3. Hitung Kunjungan KHUSUS HARI INI
        const kunjunganHariIni = rawData.filter(
          (log: any) => log.tanggal === todayStr,
        );
        setTotalHadir(kunjunganHariIni.length);
        setHadirMahasiswa(
          kunjunganHariIni.filter((log: any) => log.role === "student").length,
        );
        setHadirStaff(
          kunjunganHariIni.filter((log: any) => log.role !== "student").length,
        );

        // 4. Buat Peta Tanggal Kosong selama 180 Hari (Agar grafik tidak bolong jika ada hari libur)
        const dateMap: Record<string, number> = {};
        for (
          let d = new Date(sixMonthsAgo);
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          const isoDate = formatDate(new Date(d));
          dateMap[isoDate] = 0;
        }

        // 5. Isi Peta Tanggal dengan jumlah kehadiran
        rawData.forEach((log: any) => {
          if (dateMap[log.tanggal] !== undefined) {
            dateMap[log.tanggal] += 1;
          }
        });

        // 6. Ubah ke format Array yang diminta Recharts
        const chartDataUtuh = Object.keys(dateMap)
          .sort()
          .map((date) => {
            const d = new Date(date);
            return {
              rawDate: date, // Disimpan untuk filtering
              tanggal: d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              }),
              total: dateMap[date],
            };
          });

        // 7. Potong array menjadi 3 bagian: 7 Hari, 30 Hari, dan 180 Hari
        setChartData6M(chartDataUtuh);
        setChartData1M(chartDataUtuh.slice(-30));
        setChartData1W(chartDataUtuh.slice(-7));

        // Update waktu sinkronisasi
        setLastUpdated(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      }
    } catch (error) {
      console.error("Gagal menarik data dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // KOMPONEN MINI CHART DENGAN FIX 99% WIDTH
  const MiniChart = ({
    title,
    data,
    gradientId,
    colorHex,
  }: {
    title: string;
    data: any[];
    gradientId: string;
    colorHex: string;
  }) => (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col h-full relative overflow-hidden group hover:border-slate-300 transition-colors">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {loading || !isMounted ? (
        <div className="flex items-center justify-center text-slate-400 font-mono text-[10px] animate-pulse h-[200px]">
          Menyiapkan visualisasi...
        </div>
      ) : (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="99%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: -30, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorHex} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colorHex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="tanggal"
                stroke="#94a3b8"
                fontSize={9}
                tickMargin={8}
                minTickGap={15}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={9}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val === 0 ? "" : val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "10px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: colorHex, fontWeight: "bold" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Hadir"
                stroke={colorHex}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                activeDot={{
                  r: 4,
                  fill: colorHex,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 w-full text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-800">
            OVERVIEW ABSENSI
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Data rekapitulasi kunjungan JIU Library.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm w-full md:w-auto">
          {lastUpdated && (
            <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
              Update: {lastUpdated} WIB
            </div>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Menyinkronkan..." : "🔄 Refresh Data"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-[30px] pointer-events-none"></div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">
            Total Kunjungan (Hari Ini)
          </p>
          <div className="flex items-end gap-2 relative z-10">
            <h2 className="text-4xl font-black text-slate-800 leading-none">
              {totalHadir}
            </h2>
            <span className="text-blue-600 text-xs font-bold mb-1">orang</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100 rounded-full blur-[30px] pointer-events-none"></div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">
            Kunjungan Mahasiswa
          </p>
          <div className="flex items-end gap-2 relative z-10">
            <h2 className="text-4xl font-black text-slate-800 leading-none">
              {hadirMahasiswa}
            </h2>
            <span className="text-sky-600 text-xs font-bold mb-1">orang</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-[30px] pointer-events-none"></div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">
            Kunjungan Dosen & Staff
          </p>
          <div className="flex items-end gap-2 relative z-10">
            <h2 className="text-4xl font-black text-slate-800 leading-none">
              {hadirStaff}
            </h2>
            <span className="text-indigo-600 text-xs font-bold mb-1">
              orang
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-2xl shadow-sm w-full">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Visualisasi Kunjungan Berkala
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MiniChart
            title="Tren 7 Hari Terakhir"
            data={chartData1W}
            gradientId="color1W"
            colorHex="#2563eb"
          />
          <MiniChart
            title="Tren 30 Hari Terakhir"
            data={chartData1M}
            gradientId="color1M"
            colorHex="#0284c7"
          />
          <MiniChart
            title="Tren 6 Bulan Terakhir"
            data={chartData6M}
            gradientId="color6M"
            colorHex="#4f46e5"
          />
        </div>
      </div>
    </div>
  );
}
