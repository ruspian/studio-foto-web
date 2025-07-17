"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

export default function CetakPage() {
  const [bingkai, setBingkai] = useState("hitam");
  const [selectedFotoUrls, setSelectedFotoUrls] = useState(new Set());
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const maxFoto = 8;

  const fotosDipilih = Array.from(selectedFotoUrls);

  const handlePilihFoto = useCallback(
    (fotoUrl) => {
      setSelectedFotoUrls((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(fotoUrl)) {
          newSet.delete(fotoUrl);
        } else {
          if (newSet.size < maxFoto) {
            newSet.add(fotoUrl);
          } else {
            alert(`Anda hanya bisa memilih maksimal ${maxFoto} foto.`);
          }
        }
        return newSet;
      });
    },
    [maxFoto]
  );

  const fetchFoto = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/foto");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const formattedData = data.map((filename) => `/foto/${filename}`);
      setAvailableFotos(formattedData.reverse());
    } catch (err) {
      console.error("Gagal memuat foto:", err);
      setError("Gagal memuat foto. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto();
    // const interval = setInterval(fetchFoto, 5000);
    // return () => clearInterval(interval);
  }, [fetchFoto]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        #print-root {
          padding: 0;
          margin: 0;
          margin-top: 60px;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          background-color: #f3f4f6;
          overflow: auto;
        }

        .a4-container-web {
          flex: 1;
          padding: 1.5cm;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow: auto;
        }

        .a4-paper {
          width: 21cm;
          height: 29.7cm;
        }

        .right-panel {
          width: 300px;
          flex-shrink: 0;
        }

        /* --- Gaya Khusus Untuk Cetak (@media print) --- */
        @media print {
          /* *** KUNCI PERBAIKAN WARNA: print-color-adjust *** */
          /* Memaksa browser untuk mencetak warna latar belakang dan gambar persis */
          .foto-bingkai {
            -webkit-print-color-adjust: exact !important; /* Untuk Chrome, Safari, Edge */
            print-color-adjust: exact !important; /* Standar CSS */
          }

          /* Sembunyikan semua elemen anak langsung dari BODY KECUALI yang memiliki ID 'print-root' */
          body > *:not(#print-root) {
            display: none !important;
          }

          /* Atur #print-root untuk layout cetak */
          #print-root {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            background-color: white !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            align-items: center !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }

          .right-panel {
            display: none !important;
          }

          .a4-container-web {
            padding: 0 !important;
            background-color: white !important;
            display: block !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
            flex: none !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
          }

          .a4-paper {
            width: 21cm !important;
            height: 29.7cm !important;
            border: 1px solid transparent !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            position: relative !important;
          }

          /* Gaya Bingkai Foto untuk cetak - akan menimpa gaya inline dengan !important */
          .foto-bingkai {
            /* Pastikan properti warna diterapkan dengan !important */
            /* Atur border dan background-color di sini secara eksplisit */
            border: 1px solid ${bingkai === "hitam" ? "#aaa" : "#000"} !important;
            background-color: ${bingkai === "hitam"
              ? "#000"
              : "#aaa"} !important;
          }

          /* Menghapus gaya spesifik bingkai-hitam/abu di print agar .foto-bingkai yang memegang kontrol */
          /* .foto-bingkai.bingkai-hit, .foto-bingkai.bingkai-abu tidak perlu lagi di sini,
             karena .foto-bingkai sudah menangani warna dinamis. */

          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
        }
      `}</style>

      <div
        id="print-root"
        className="py-20 mt-2 px-8 flex flex-row w-full h-screen overflow-hidden"
      >
        <div className="a4-container-web">
          <div
            className="bg-white shadow-md relative a4-paper"
            style={{
              width: "21cm",
              height: "29.7cm",
              padding: "0",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              position: "relative",
            }}
          >
            {Array.from({ length: maxFoto }).map((_, index) => {
              const row = Math.floor(index / 4);
              const col = index % 4;
              const top = row * (8 + 0);
              const left = col * (5 + 0);
              const foto = fotosDipilih[index];

              return (
                <div
                  key={index}
                  className={`foto-bingkai`} // Hanya kelas 'foto-bingkai' di sini
                  style={{
                    width: "5cm",
                    height: "8cm",
                    // *** KEMBALIKAN INLINE STYLE UNTUK TAMPILAN WEB DI SINI ***
                    border: `0.3cm solid ${
                      bingkai === "hitam" ? "#000" : "#aaa"
                    }`,
                    backgroundColor: `${bingkai === "hitam" ? "#000" : "#aaa"}`,
                    padding: "0.2cm",
                    boxSizing: "border-box",
                    position: "absolute",
                    top: `${top}cm`,
                    left: `${left}cm`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "0.2px solid #ccc",
                  }}
                >
                  <div
                    style={{
                      width: "4.4cm",
                      height: "7.4cm",
                      backgroundColor: "#ddd",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {foto ? (
                      <Image
                        src={foto}
                        alt={`Foto terpilih ${index + 1}`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">Pilih Foto</span>
                    )}
                  </div>

                  <div className="mt-2 text-center flex-shrink-0">
                    <Image
                      src={
                        bingkai === "hitam"
                          ? "/logoPutih.png"
                          : "/logoHitam.png"
                      }
                      alt="Logo Studio"
                      width={100}
                      height={50}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-panel p-4 bg-white border-l overflow-y-auto">
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Pilih Bingkai</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setBingkai("hitam")}
                className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                  bingkai === "hitam"
                    ? "bg-black text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                Hitam
              </button>
              <button
                onClick={() => setBingkai("abu")}
                className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                  bingkai === "abu"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                Abu-Abu
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={fotosDipilih.length === 0}
            >
              Cetak
            </button>
          </div>
          <h2 className="text-lg font-semibold mb-4 mt-4">Pilih Foto</h2>

          {loading && (
            <p className="text-center text-gray-500">Memuat foto...</p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && availableFotos.length === 0 && (
            <p className="text-center text-gray-500">
              Tidak ada foto tersedia.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {availableFotos.map((fotoUrl, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 ${
                  selectedFotoUrls.has(fotoUrl)
                    ? "border-green-500"
                    : "border-transparent"
                }`}
                onClick={() => handlePilihFoto(fotoUrl)}
              >
                <Image
                  src={fotoUrl}
                  alt={`Foto tersedia ${index + 1}`}
                  width={120}
                  height={80}
                  className="object-cover w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
