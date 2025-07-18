// app/page.js
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoTrashOutline } from "react-icons/io5"; // Icon untuk hapus
import imageCompression from "browser-image-compression"; // Library kompresi

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State untuk modal hapus
  const [fotoToDelete, setFotoToDelete] = useState(null); // State untuk foto yang akan dihapus
  const fileInputRef = useRef(null);

  // Fungsi untuk mengambil daftar foto dari server
  const fetchFoto = useCallback(async () => {
    setLoadingFotos(true);
    setError(null);
    try {
      const res = await fetch("/api/foto", {
        cache: "no-store",
      });
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

    const formData = new FormData();
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`File '${file.name}' bukan format gambar yang didukung.`);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      try {
        // Opsi kompresi gambar
        const options = {
          maxSizeMB: 0.8, // Maksimal 0.8 MB per foto
          maxWidthOrHeight: 1920, // Maksimal dimensi lebar/tinggi 1920px
          useWebWorker: true, // Gunakan Web Worker untuk kompresi di background
        };
        const compressedFile = await imageCompression(file, options);

        // Validasi ukuran setelah kompresi (jika kompresi tidak efektif)
        if (compressedFile.size > 5 * 1024 * 1024) {
          setError(
            `Ukuran file '${file.name}' setelah kompresi masih terlalu besar (maks 5MB).`
          );
          setUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        formData.append("files", compressedFile, file.name);
      } catch (compressionError) {
        setError(`Gagal mengkompres gambar '${file.name}'.`);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }

    try {
      const res = await fetch("/api/upload-foto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      const data = await res.json();
      setMessage(`Berhasil mengunggah ${data.files.length} foto!`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchFoto(); // Panggil ulang untuk memuat daftar foto terbaru
    } catch (err) {
      setError(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setMessage("");
        setError(null);
      }, 5000);
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi hapus
  const confirmDelete = (fotoUrl) => {
    setFotoToDelete(fotoUrl);
    setShowDeleteModal(true);
  };

  // Fungsi untuk menghapus foto (setelah konfirmasi)
  const handleDeleteFoto = async () => {
    if (!fotoToDelete) return; // Pastikan ada foto yang akan dihapus

    const filename = fotoToDelete.split("/").pop();

    setShowDeleteModal(false); // Sembunyikan modal
    setFotoToDelete(null); // Reset foto yang akan dihapus
    setLoadingFotos(true); // Tampilkan loading saat menghapus

    try {
      const res = await fetch("/api/foto", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: filename }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      setMessage("Foto berhasil dihapus!");
      await fetchFoto(); // Panggil ulang untuk memuat daftar foto terbaru
    } catch (err) {
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
              Sabar coy...
            </p>
          )}
          {message && (
            <p className="mt-4 text-md font-medium text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-md font-medium text-red-600">{error}</p>
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
          Galeri Foto Server
        </h2>

        {loadingFotos && (
          <p className="text-center text-gray-500 py-4">Memuat foto...</p>
        )}
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        {!loadingFotos && !error && availableFotos.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Gak ada foto. Unggah dulu!
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {availableFotos.map((fotoUrl, index) => (
            <div
              key={index}
              className="relative border-2 border-gray-200 rounded-md overflow-hidden shadow-sm w-full h-40" // Menggunakan aspect ratio
            >
              <Image
                src={fotoUrl}
                alt={`Foto server ${index + 1}`}
                fill // Menggunakan fill untuk mengisi kontainer
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw" // Optimalisasi ukuran gambar
                className="object-cover" // Pastikan gambar mengisi area tanpa distorsi
              />
              <button
                onClick={() => confirmDelete(fotoUrl)} // Panggil confirmDelete
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
