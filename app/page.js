// app/page.js
"use client";

import { useState, useRef, useEffect, useCallback } from "react"; // Tambahkan useEffect dan useCallback
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { IoTrashOutline } from "react-icons/io5";

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [availableFotos, setAvailableFotos] = useState([]); // State baru untuk daftar foto
  const [loadingFotos, setLoadingFotos] = useState(true); // State untuk loading galeri
  const fileInputRef = useRef(null);

  // Fungsi untuk mengambil daftar foto dari server
  const fetchFoto = useCallback(async () => {
    setLoadingFotos(true);
    setError(null);
    try {
      const res = await fetch("/api/foto", {
        cache: "no-store", // Penting: Jangan gunakan cache untuk memastikan data terbaru
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const formattedData = data.map((filename) => `/foto/${filename}`);
      setAvailableFotos(formattedData.reverse()); // Tampilkan foto terbaru di atas
    } catch (err) {
      console.error("Gagal memuat foto:", err);
      setError("Gagal memuat foto. Silakan coba lagi nanti.");
    } finally {
      setLoadingFotos(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto(); // Panggil saat komponen dimuat pertama kali
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
      if (file.size > 5 * 1024 * 1024) {
        setError(`Ukuran file '${file.name}' terlalu besar (maks 5MB).`);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError(`File '${file.name}' bukan format gambar yang didukung.`);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      formData.append("files", file);
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
      console.error("Gagal mengunggah foto:", err);
      setError(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setMessage("");
        setError(null);
      }, 5000);
    }
  };

  // Fungsi untuk menghapus foto
  const handleDeleteFoto = async (fotoUrl) => {
    // Ekstrak nama file dari URL
    const filename = fotoUrl.split("/").pop();

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
            <p className="mt-4 text-md font-medium text-blue-600">Sabar...</p>
          )}
          {message && (
            <p className="mt-4 text-md font-medium text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-md font-medium text-red-600">{error}</p>
          )}
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
              className="relative border-2 border-gray-200 rounded-md overflow-hidden shadow-sm"
            >
              <Image
                src={fotoUrl}
                alt={`Foto server ${index + 1}`}
                width={150}
                height={300}
                className="object-cover w-full h-28" // Adjust height as needed
              />
              <button
                onClick={() => handleDeleteFoto(fotoUrl)}
                className="absolute top-1 cursor-pointer right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none"
                title="Hapus Foto Ini"
              >
                <IoTrashOutline className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
