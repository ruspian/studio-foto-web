"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const ambilFoto = async () => {
    setLoading(true);
    try {
      await fetch("/api/cekrek");
      await fetchFoto(); // Langsung fetch tanpa delay
    } catch (error) {
      console.error("Gagal ambil foto:", error);
    }
    setLoading(false);
  };

  const fetchFoto = async () => {
    try {
      const res = await fetch("/api/foto");
      const data = await res.json();
      setFotos(data.reverse()); // Biar foto terbaru muncul di depan
    } catch (error) {
      console.error("Gagal fetch foto:", error);
    }
  };

  useEffect(() => {
    fetchFoto();
    const interval = setInterval(fetchFoto, 5000); // Update setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 mt-10 px-8">
      <h1 className="text-3xl font-bold mb-4">Rana Kenangan Studio Foto</h1>

      <button
        onClick={ambilFoto}
        className="bg-emerald-600 text-white px-5 py-3 rounded shadow hover:bg-emerald-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "📷 Mengambil Foto..." : "📷 Ambil Foto"}
      </button>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mt-6">
        {fotos.map((src, idx) => (
          <div key={idx} className="relative">
            <Image
              src={`/foto/${src}`}
              alt={`foto-${idx}`}
              className="border rounded shadow"
              width={400}
              height={600}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
