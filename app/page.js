// app/page.js
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoTrashOutline } from "react-icons/io5";
import imageCompression from "browser-image-compression";

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fotoToDelete, setFotoToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Fungsi untuk mengambil daftar foto dari Vercel Blob via API
  const fetchFoto = useCallback(async () => {
    setLoadingFotos(true);
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
      setLoadingFotos(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto();
  }, [fetchFoto]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError(null);

    let uploadedCount = 0;
    const tempErrors = [];

    // Loop untuk setiap file yang dipilih
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        tempErrors.push(
          `File '${file.name}' bukan format gambar yang didukung.`
        );
        continue; // Lanjutkan ke file berikutnya
      }

      let fileToUpload = file;
      try {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        console.log(
          `Ukuran asli '${file.name}': ${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB`
        );
        const compressedFile = await imageCompression(file, options);
        console.log(
          `Ukuran terkompresi '${file.name}': ${(
            compressedFile.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );

        // Batasan 4MB Vercel Blob
        if (compressedFile.size > 4 * 1024 * 1024) {
          tempErrors.push(
            `Ukuran file '${file.name}' setelah kompresi masih terlalu besar (maks 4MB).`
          );
          continue;
        }
        fileToUpload = compressedFile;
      } catch (compressionError) {
        console.error("Error kompresi gambar:", compressionError);
        tempErrors.push(`Gagal mengkompres gambar '${file.name}'.`);
        continue;
      }

      // Upload satu per satu ke Vercel Blob
      const formData = new FormData();
      formData.append("file", fileToUpload);

      try {
        const res = await fetch("/api/upload", {
          // Endpoint PUT Vercel Blob
          method: "PUT", // Gunakan metode PUT
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${res.status}`
          );
        }

        uploadedCount++; // Ini sekarang akan bekerja
      } catch (err) {
        console.error(`Gagal mengunggah '${file.name}':`, err);
        tempErrors.push(`Gagal mengunggah '${file.name}': ${err.message}`);
      }
    } // End of for loop

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input file
    }

    if (uploadedCount > 0) {
      setMessage(`Berhasil mengunggah ${uploadedCount} foto!`);
    }
    if (tempErrors.length > 0) {
      setError(tempErrors.join("\n")); // Tampilkan semua error yang terjadi
    } else if (uploadedCount === 0 && tempErrors.length === 0) {
      setError("Tidak ada foto yang berhasil diunggah.");
    }

    await fetchFoto(); // Panggil ulang untuk memuat daftar foto terbaru dari Blob

    setUploading(false);
    setTimeout(() => {
      setMessage("");
      setError(null);
    }, 5000);
  };

  // Fungsi untuk menampilkan modal konfirmasi hapus
  const confirmDelete = (fotoUrl) => {
    setFotoToDelete(fotoUrl);
    setShowDeleteModal(true);
  };

  // Fungsi untuk menghapus foto (setelah konfirmasi)
  const handleDeleteFoto = async () => {
    if (!fotoToDelete) return;

    // Mengirim imageUrl sebagai query parameter
    setLoadingFotos(true);
    setShowDeleteModal(false);
    setFotoToDelete(null);

    try {
      // Endpoint DELETE Vercel Blob
      const res = await fetch(
        `/api/upload?imageUrl=${encodeURIComponent(fotoToDelete)}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      setMessage("Foto berhasil dihapus!");
      await fetchFoto();
    } catch (err) {
      console.error("Gagal menghapus foto:", err);
      setError(`Gagal menghapus foto: ${err.message}`);
    } finally {
      setLoadingFotos(false);
      setTimeout(() => {
        setMessage("");
        setError(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-2 mt-3">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Unggah Foto Untuk Cetak
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Unggah Foto Baru
        </h2>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700 border border-gray-500 rounded-full
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          {uploading && (
            <p className="mt-4 text-md font-medium text-blue-600">
              Sabar Coy..
            </p>
          )}
          {message && (
            <p className="mt-4 text-md font-medium text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-md font-medium text-red-600 whitespace-pre-wrap">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs text-gray-500">
            Klik Choose Files kalo lo mau unggah foto.
          </p>
        </div>

        <Link
          href="/cetak"
          className="inline-block bg-emerald-600 text-white px-4 py-3 rounded-sm font-semibold hover:bg-emerald-700 transition-colors duration-200 mt-4 text-xs"
        >
          Cetak? Klik ini!
        </Link>
      </div>

      {/* Bagian Menampilkan Foto yang Diunggah */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
          Galeri Foto
        </h2>

        {loadingFotos && (
          <p className="text-center text-gray-500 py-4">Memuat foto...</p>
        )}
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        {!loadingFotos && !error && availableFotos.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Gak ada foto di Vercel Blob. Unggah dulu!
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {availableFotos.map((fotoUrl, index) => (
            <div
              key={fotoUrl} // Gunakan fotoUrl sebagai key karena unik
              className="relative border-2 border-gray-200 rounded-md overflow-hidden shadow-sm w-full h-36"
            >
              <Image
                src={fotoUrl}
                alt={`Foto server ${index + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <button
                onClick={() => confirmDelete(fotoUrl)}
                className="absolute top-1 cursor-pointer right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none opacity-80 hover:opacity-100 transition-opacity"
                title="Hapus Foto Ini"
              >
                <IoTrashOutline className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Konfirmasi Hapus Foto
            </h3>
            <p className="text-gray-600 mb-6">
              Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteFoto}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
