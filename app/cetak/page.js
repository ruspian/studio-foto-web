"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

export default function CetakPage() {
  // Bingkai tidak lagi menjadi state pilihan, tapi akan ditentukan oleh posisi
  const [selectedFotoUrls, setSelectedFotoUrls] = useState(new Set());
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const maxFoto = 8; // Kembali ke 8 foto total untuk satu halaman A4

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
      const res = await fetch("/api/upload", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json(); // Data sekarang adalah array URL
      setAvailableFotos(data.reverse()); // Tampilkan foto terbaru di atas
    } catch (err) {
      console.error("Gagal memuat foto dari Vercel Blob:", err);
      setError("Gagal memuat foto dari Vercel Blob. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto();
  }, [fetchFoto]);

  const handlePrint = () => {
    if (fotosDipilih.length === 0) {
      alert("Pilih setidaknya satu foto untuk dicetak.");
      return;
    }
    window.print();
  };

  // --- Parameter Layout Cetak  ---
  const FOTO_LEBAR_CM = 5; // Lebar total bingkai termasuk border/padding
  const FOTO_TINGGI_CM = 8; // Tinggi total bingkai termasuk border/padding
  const BORDER_BINGKAI_CM = 0; // Tebal border bingkai
  const PADDING_FOTO_CM = 0.4; // Padding di dalam bingkai sebelum gambar
  const LOGO_TINGGI_CM = 1.5; // Estimasi tinggi area logo di bawah gambar

  // Parameter untuk border dashed (tanda gunting)
  const DASH_BORDER_THICKNESS_CM = 0.01; // Tebal garis putus-putus
  const DASH_BORDER_COLOR = "#ffffff"; // Warna garis putus-putus

  // Hitungan untuk area gambar bersih di dalam bingkai
  const GAMBAR_LEBAR_CM =
    FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM - 2 * PADDING_FOTO_CM;
  const GAMBAR_TINGGI_CM =
    FOTO_TINGGI_CM -
    2 * BORDER_BINGKAI_CM -
    2 * PADDING_FOTO_CM -
    LOGO_TINGGI_CM;

  // Jarak antar foto di dalam grup 2x2
  const GAP_WITHIN_GROUP_HORIZONTAL_CM = 0; // Jarak horizontal antara foto dalam 2x2
  const GAP_WITHIN_GROUP_VERTICAL_CM = 0; // Jarak vertikal antara foto dalam 2x2

  // Jarak antara template hitam dan abu-abu
  const GAP_BETWEEN_TEMPLATES_CM = 0.5; // Jarak antara blok hitam dan abu-abu

  // Padding kertas A4
  const PAGE_INTERNAL_PADDING_CM = 0.2; // Sedikit lebih besar agar tidak terlalu mepet

  // Posisi absolut untuk setiap foto di dalam A4 (4 hitam kiri, 4 abu-abu kanan)
  const getFotoPosition = (index) => {
    let x, y;
    let fotoGroupIndex; // Index dalam grup

    if (index < 4) {
      // Template Hitam (indeks 0, 1, 2, 3)
      fotoGroupIndex = index;
      const col = fotoGroupIndex % 2; // Kolom 0 atau 1
      const row = Math.floor(fotoGroupIndex / 2); // Baris 0 atau 1

      x =
        PAGE_INTERNAL_PADDING_CM +
        col * (FOTO_LEBAR_CM + GAP_WITHIN_GROUP_HORIZONTAL_CM);
      y =
        PAGE_INTERNAL_PADDING_CM +
        row * (FOTO_TINGGI_CM + GAP_WITHIN_GROUP_VERTICAL_CM);
    } else {
      // Template Abu-abu
      fotoGroupIndex = index - 4;
      const col = fotoGroupIndex % 2;
      const row = Math.floor(fotoGroupIndex / 2);

      // Hitung offset X untuk template abu-abu
      const offsetXTemplates =
        PAGE_INTERNAL_PADDING_CM + // Padding awal
        2 * FOTO_LEBAR_CM + // Lebar 2 foto hitam
        1 * GAP_WITHIN_GROUP_HORIZONTAL_CM + // 1 jarak antar foto hitam
        GAP_BETWEEN_TEMPLATES_CM; // Jarak antara template

      x =
        offsetXTemplates +
        col * (FOTO_LEBAR_CM + GAP_WITHIN_GROUP_HORIZONTAL_CM);
      y =
        PAGE_INTERNAL_PADDING_CM +
        row * (FOTO_TINGGI_CM + GAP_WITHIN_GROUP_VERTICAL_CM);
    }
    return { top: `${y}cm`, left: `${x}cm` };
  };

  return (
    <>
      <style jsx global>{`
        /* Reset umum */
        html,
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #f3f4f6; /* Latar belakang default untuk web */
        }

        /* --- Gaya Untuk Tampilan Web --- */
        #print-root {
          padding-top: 60px; /* Jarak atas, sesuaikan jika ada navbar */
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          width: 100vw;
          min-height: 100vh;
          overflow: auto; /* Mengizinkan scroll jika konten melebihi layar */
        }

        .a4-container-web {
          flex: 1; /* Mengambil sisa ruang */
          padding: 20px; /* Padding di sekitar kertas A4 */
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow: auto;
        }

        .a4-paper-web {
          width: 21cm;
          height: 29.7cm; /* Tetap A4 di web untuk preview */
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #ccc;
          position: relative; /* Penting untuk foto absolut di web preview */
          box-sizing: border-box; /* Padding termasuk dalam ukuran */
        }

        .right-panel {
          width: 320px; /* Lebar tetap untuk panel kontrol */
          flex-shrink: 0;
          background-color: white;
          border-left: 1px solid #e5e7eb;
          padding: 20px;
          overflow-y: auto;
          position: sticky; /* Tetap terlihat saat scroll A4 */
          top: 60px; /* Sejajarkan dengan padding-top #print-root */
          height: calc(100vh - 60px); /* Isi sisa tinggi viewport */
        }

        /* Gaya Bingkai Foto di Web & Print (CSS dasar yang sama) */
        .foto-bingkai-item {
          width: ${FOTO_LEBAR_CM}cm;
          height: ${FOTO_TINGGI_CM}cm;
          box-sizing: border-box;
          overflow: hidden;
          position: absolute; /* Penting untuk posisi di A4 */
        }

        /* Kelas spesifik untuk warna bingkai */
        .foto-bingkai-item.hitam {
          border: ${BORDER_BINGKAI_CM}cm solid #000;
          background-color: #000;
        }
        .foto-bingkai-item.abu {
          border: ${BORDER_BINGKAI_CM}cm solid #aaa;
          background-color: #aaa;
        }

        .foto-bingkai-item .image-wrapper {
          position: absolute;
          top: ${BORDER_BINGKAI_CM + PADDING_FOTO_CM}cm;
          left: ${BORDER_BINGKAI_CM + PADDING_FOTO_CM}cm;
          width: ${GAMBAR_LEBAR_CM}cm;
          height: ${GAMBAR_TINGGI_CM}cm;
          overflow: hidden;
          background-color: #ddd; /* Placeholder */
          z-index: 2; /* Di atas background bingkai */

          /* Pemusatan dengan flexbox di image-wrapper (untuk span "Pilih Foto") */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Gaya khusus untuk Image di dalam image-wrapper */
        .foto-bingkai-item .image-wrapper > div {
          /* Target div yang dihasilkan Next.js Image */
          position: absolute !important; /* Pastikan ini absolute relatif terhadap image-wrapper */
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important; /* Pemusatan transform */
          width: 100% !important; /* Pastikan mengisi area */
          height: 100% !important; /* Pastikan mengisi area */
        }
        .foto-bingkai-item .image-wrapper img {
          width: 100% !important; /* Paksa gambar mengisi lebar kontainer */
          height: 100% !important; /* Paksa gambar mengisi tinggi kontainer */
          object-fit: cover !important; /* Pastikan gambar mengisi tanpa merusak aspek rasio */
        }
        /* Gaya khusus untuk span "Pilih Foto" */
        .foto-bingkai-item .image-wrapper span {
          text-align: center;
          width: 100%; /* Pastikan span mengambil lebar penuh untuk text-align center */
        }

        .foto-bingkai-item .logo-wrapper {
          position: absolute;
          width: ${FOTO_LEBAR_CM - 2 * BORDER_BINGKAI_CM}cm;
          height: ${LOGO_TINGGI_CM}cm;
          bottom: ${BORDER_BINGKAI_CM}cm;
          left: ${BORDER_BINGKAI_CM}cm;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2; /* Di atas background bingkai */
        }

        /* Div untuk garis putus-putus */
        .foto-bingkai-item .cut-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: ${DASH_BORDER_THICKNESS_CM}cm dashed ${DASH_BORDER_COLOR};
          box-sizing: border-box;
          pointer-events: none; /* Agar tidak mengganggu interaksi */
          z-index: 3; /* Pastikan di atas gambar dan logo di web preview */
        }

        /* --- Gaya Khusus Untuk Cetak (@media print) --- */
        @media print {
          /* Kunci untuk mencetak warna latar belakang dan gambar persis */
          .foto-bingkai-item,
          .a4-paper-web {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Sembunyikan semua elemen anak langsung dari BODY KECUALI yang memiliki ID 'print-root' */
          body > *:not(#print-root) {
            display: none !important;
          }

          /* Atur #print-root untuk layout cetak */
          #print-root {
            width: 100vw !important;
            height: 100vh !important;
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

          /* Sembunyikan panel kanan saat cetak */
          .right-panel {
            display: none !important;
          }

          /* Atur kontainer A4 untuk cetak */
          .a4-container-web {
            flex: none !important;
            padding: 0 !important;
            background-color: white !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }

          /* Kertas A4 utama untuk cetak */
          .a4-paper-web {
            width: 21cm !important;
            height: 29.7cm !important;
            min-height: 29.7cm !important;
            border: none !important; /* Hapus border di hasil cetak */
            box-shadow: none !important; /* Hapus shadow di hasil cetak */
            margin: 0 auto !important;
            position: relative !important; /* Pertahankan ini untuk posisi absolut anak */
            padding: 0 !important; /* Jangan ada padding di sini, biar foto pas */
            box-sizing: border-box !important;
          }

          /* Gaya Bingkai Foto di Cetak */
          .foto-bingkai-item {
            position: absolute !important;
          }
          /* Kelas spesifik untuk warna bingkai saat cetak */
          .foto-bingkai-item.hitam {
            border: ${BORDER_BINGKAI_CM}cm solid #000 !important;
            background-color: #000 !important;
          }
          .foto-bingkai-item.abu {
            border: ${BORDER_BINGKAI_CM}cm solid #aaa !important;
            background-color: #aaa !important;
          }

          .foto-bingkai-item .image-wrapper {
            /* Pastikan display flex tetap ada untuk span "Pilih Foto" */
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 5 !important; /* Di bawah cut-line untuk cetak */
          }

          /* Gaya khusus untuk Image di dalam image-wrapper saat cetak */
          .foto-bingkai-item .image-wrapper > div {
            /* Target div yang dihasilkan Next.js Image */
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            height: 100% !important;
          }
          .foto-bingkai-item .image-wrapper img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          .foto-bingkai-item .image-wrapper span {
            text-align: center !important;
          }

          .foto-bingkai-item .logo-wrapper {
            z-index: 5 !important; /* Di bawah cut-line untuk cetak */
          }

          .foto-bingkai-item .cut-line {
            z-index: 10 !important; /* Pastikan di atas semua konten untuk cetak */
          }

          /* Pengaturan Halaman untuk Cetak Tanpa Tepi */
          @page {
            size: A4 portrait;
            margin: 0; /* Set margin ke 0 untuk cetak tanpa tepi */
          }
        }
      `}</style>

      <div id="print-root">
        <div className="a4-container-web">
          <div className="a4-paper-web">
            {Array.from({ length: maxFoto }).map((_, index) => {
              const foto = fotosDipilih?.[index];
              const { top, left } = getFotoPosition(index);
              // Tentukan warna bingkai berdasarkan index
              const bingkaiColorClass = index < 4 ? "hitam" : "abu";
              const logoSrc = index < 4 ? "/logoPutih.png" : "/logoHitam.png";

              return (
                <div
                  key={index}
                  className={`foto-bingkai-item ${bingkaiColorClass}`} // Tambahkan kelas warna
                  style={{ top: top, left: left }}
                >
                  <div className="cut-line"></div>

                  <div className="image-wrapper">
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

                  <div className="logo-wrapper">
                    <Image
                      src={logoSrc} // Logo sesuai warna bingkai
                      alt="Logo Studio"
                      width={100}
                      height={50}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="right-panel p-4">
          <h2 className="text-xl font-bold mb-4">Pengaturan Cetak</h2>

          <div className="mb-6">
            <p className="text-base text-gray-700 mb-2">
              Foto dipilih:{" "}
              <span className="font-semibold text-lg">
                {fotosDipilih.length}
              </span>{" "}
              dari {maxFoto}
            </p>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-lg font-semibold hover:bg-emerald-700 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={fotosDipilih.length === 0}
            >
              Cetak Sekarang
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Galeri Foto
          </h3>

          {loading && (
            <p className="text-center text-gray-500 py-4">Memuat foto...</p>
          )}
          {error && <p className="text-center text-red-500 py-4">{error}</p>}
          {!loading && !error && availableFotos.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Tidak ada foto tersedia di server.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {availableFotos.map((fotoUrl, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all duration-200 ${
                  selectedFotoUrls.has(fotoUrl)
                    ? "border-green-500 ring-2 ring-green-500"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => handlePilihFoto(fotoUrl)}
              >
                <Image
                  src={fotoUrl}
                  alt={`Foto tersedia ${index + 1}`}
                  width={200}
                  height={150}
                  className="object-cover w-full h-24"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
