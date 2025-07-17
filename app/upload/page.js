"use client";

import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react"; // Import library QR Code
import { ImGoogleDrive } from "react-icons/im";

export default function UploadPage() {
  const [availableFotosCount, setAvailableFotosCount] = useState(0);
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadedLinks, setUploadedLinks] = useState([]); // State baru untuk menyimpan link yang diunggah
  const [lastUploadTime, setLastUploadTime] = useState(null); // Untuk menampilkan waktu upload

  const fetchFotoCount = useCallback(async () => {
    console.log("Fetching foto count...");
    setLoadingFotos(true);
    setError(null);
    setMessage("");
    setUploadedLinks([]); // Reset link saat memuat ulang jumlah foto
    try {
      const res = await fetch("/api/foto");
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(
          `Gagal memuat daftar foto: ${res.status} ${
            res.statusText
          }. Respon: ${errorData.substring(
            0,
            Math.min(errorData.length, 100)
          )}...`
        );
      }
      const data = await res.json();
      const imageFiles = data.filter((filename) =>
        /\.(jpg|jpeg|png)$/i.test(filename)
      );
      setAvailableFotosCount(imageFiles.length);
      console.log(`Detected ${imageFiles.length} fotos.`);
    } catch (err) {
      console.error("Kesalahan saat memuat daftar foto:", err);
      setError(`Kesalahan memuat foto: ${err.message}`);
      setAvailableFotosCount(0);
    } finally {
      setLoadingFotos(false);
      console.log("Finished fetching foto count. loadingFotos set to false.");
    }
  }, []);

  useEffect(() => {
    console.log("UploadPage mounted. Setting up fetch interval.");
    fetchFotoCount();
    // Tidak perlu interval refresh 5 detik jika kita ingin link muncul setelah upload.
    // const interval = setInterval(fetchFotoCount, 5000);
    // return () => clearInterval(interval);
    return () => {
      console.log("UploadPage unmounted. Clearing fetch interval.");
    };
  }, [fetchFotoCount]);

  const handleUploadAllToDriveAndClearLocal = async () => {
    if (loadingFotos || uploadingAll || availableFotosCount === 0) {
      console.warn(
        "Tombol seharusnya DISABLED, aksi dibatalkan karena kondisi tidak terpenuhi."
      );
      return;
    }

    const confirmUpload = confirm(
      `Apakah Anda yakin ingin mengunggah ${availableFotosCount} foto dari folder 'public/foto' ke Google Drive dan menghapusnya dari server secara permanen?`
    );

    // if (!confirmUpload) {
    //   // Hapus komentar ini
    //   console.log("Upload dibatalkan oleh pengguna.");
    //   return;
    // }

    setUploadingAll(true);
    setMessage("");
    setError("");
    setUploadedLinks([]); // Reset link dari upload sebelumnya
    setLastUploadTime(null); // Reset waktu upload

    try {
      const res = await fetch("/api/uploadToDrive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (jsonParseError) {
          console.error(
            "Failed to parse error response as JSON:",
            jsonParseError
          );
          errorData.message = await res.text();
        }
        throw new Error(
          errorData.message ||
            `HTTP error! status: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      setMessage(
        "Proses upload ke Google Drive dan penghapusan lokal selesai!"
      );

      // Filter dan simpan hanya link yang berhasil diunggah
      const successfulUploads = data.results.filter(
        (item) => item.status === "uploaded" && item.webViewLink
      );
      setUploadedLinks(successfulUploads.map((item) => item.webViewLink));
      setLastUploadTime(new Date()); // Simpan waktu upload terakhir

      fetchFotoCount();
    } catch (err) {
      setError(
        `Terjadi kesalahan saat mengunggah: ${err.message}. Cek konsol browser dan server untuk detail.`
      );
    } finally {
      setUploadingAll(false);
      console.log("--- handleUploadAllToDriveAndClearLocal finished ---");
    }
  };

  // Logika untuk menampilkan pesan error umum atau error spesifik Google Drive
  const displayError = () => {
    if (error) {
      if (error.includes("Service Accounts do not have storage quota")) {
        return (
          <p className="text-red-600 mt-4 text-base">
            Error: Kuota penyimpanan Akun Layanan tidak cukup.{" "}
            <a
              href="https://support.google.com/a/answer/7281227"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-700"
            >
              Pelajari tentang Shared Drive
            </a>{" "}
            atau pastikan akun layanan memiliki izin di Shared Drive yang sudah
            ada.
          </p>
        );
      }
      return <p className="text-red-600 mt-4 text-base">{error}</p>;
    }
    return null;
  };

  return (
    <div className="py-20 mt-10 max-w-2xl mx-auto text-center font-sans">
      <div className="flex items-center justify-center gap-2">
        <ImGoogleDrive className="size-8" />
        <h1 className="text-3xl font-bold text-gray-800">
          Upload Semua Foto ke Google Drive
        </h1>
      </div>

      <div className="mt-8 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
        {/* Menampilkan status dan jumlah foto */}
        {loadingFotos ? (
          <p className="text-blue-600 text-lg">Mengecek foto di server...</p>
        ) : displayError() ? (
          displayError()
        ) : (
          <p className="text-xl font-semibold text-gray-700">
            Tersedia :{" "}
            <span className="text-green-600 font-bold">
              {availableFotosCount}
            </span>{" "}
            Foto.
          </p>
        )}

        {/* Tombol Upload Semua Foto ke GDrive */}
        <button
          onClick={handleUploadAllToDriveAndClearLocal}
          disabled={loadingFotos || uploadingAll || availableFotosCount === 0}
          className={`
            mt-6 px-8 py-3 rounded-lg text-white text-lg font-medium cursor-pointer transition-colors duration-300 w-full
            ${
              loadingFotos || uploadingAll || availableFotosCount === 0
                ? "bg-emerald-400 opacity-60"
                : "bg-emerald-600 hover:bg-emerald-700"
            }
          `}
        >
          {uploadingAll ? "Tunggu Bentar Coy..." : `Upload Foto ke GDrive`}
        </button>

        {/* Menampilkan pesan sukses atau error dari proses upload */}
        {message && <p className="text-green-600 mt-4 text-base">{message}</p>}
        {error &&
          uploadingAll && ( // Hanya tampilkan error saat proses upload jika itu yang terjadi
            <p className="text-red-600 mt-4 text-base">{error}</p>
          )}

        {/* Tampilan Link Google Drive dan QR Code */}
        {uploadedLinks.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">
              Hasil Upload:
            </h3>
            {lastUploadTime && (
              <p className="text-sm text-gray-600 mb-2">
                Diunggah pada: {lastUploadTime.toLocaleString()}
              </p>
            )}
            <p className="text-lg text-blue-700 mb-4">
              Semua foto berhasil diunggah!
            </p>
            <div className="flex flex-col items-center space-y-4">
              {uploadedLinks.map((link, index) => (
                <div key={index} className="flex flex-col items-center">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all text-sm"
                  >
                    Link Foto {index + 1}
                  </a>
                  <div className="mt-2 p-2 bg-white rounded-md shadow-sm">
                    <QRCodeSVG value={link} size={128} level="H" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Klik tombol upload kalo lo ingin upload foto ke Google Drive.
      </p>
    </div>
  );
}
