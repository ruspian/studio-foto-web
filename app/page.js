// app/page.js
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { IoTrashOutline } from "react-icons/io5";
import imageCompression from "browser-image-compression";
import { supabase } from "../lib/supabase";

const SUPABASE_BUCKET_NAME = "ruspian"; // NAMA BUCKET DI SUPABASE

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [availableFotos, setAvailableFotos] = useState([]);
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fotoToDelete, setFotoToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const fileInputRef = useRef(null);

  // Fungsi untuk mengambil daftar foto dari Supabase Storage
  const fetchFoto = useCallback(async () => {
    setLoadingFotos(true);
    setError(null);

    try {
      // Dapatkan daftar foto dari Supabase Storage
      const { data, error: fetchError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .list("", { sortBy: { column: "created_at", order: "desc" } });

      // jika ada error tampilkan error
      if (fetchError) {
        throw fetchError;
      }

      // ambil nama file dan buat URL publik
      const fotosWithUrls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET_NAME)
          .getPublicUrl(file.name);

        return publicUrlData.publicUrl;
      });

      setAvailableFotos(fotosWithUrls);
    } catch (err) {
      console.error("Gagal memuat foto dari Supabase Storage:", err);
      setError(
        "Gagal memuat foto dari Supabase Storage. Silakan coba lagi nanti."
      );
    } finally {
      setLoadingFotos(false);
    }
  }, []);

  useEffect(() => {
    fetchFoto();
  }, [fetchFoto]);

  // Fungsi untuk mengupload foto
  const handleFileUpload = async (event) => {
    // ambil file dari input
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage("");
    setError(null);

    // inisialisasi variabel jumlah file yang berhasil diupload
    let uploadedCount = 0;
    const tempErrors = [];

    // loop setiap file
    for (const file of files) {
      // cek apakah file adalah gambar
      if (!file.type.startsWith("image/")) {
        tempErrors.push(`Format gambar '${file.name}' tidak didukung.`);
        continue;
      }

      // inisialisasi variable untuk file yang akan diupload
      let fileToUpload = file;
      try {
        // opsi kompresi gambar
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        // kompresi gambar
        const compressedFile = await imageCompression(file, options);

        // jika ukuran file setelah kompresi lebih besar dari 1MB, tambahkan pesan kesalahan
        if (compressedFile.size > 1 * 1024 * 1024) {
          tempErrors.push(
            `Ukuran file '${file.name}' setelah kompresi masih terlalu besar (maks 1MB).`
          );
          continue;
        }

        fileToUpload = compressedFile;
      } catch (compressionError) {
        tempErrors.push(`Gagal mengkompres gambar '${file.name}'.`);
        continue;
      }

      try {
        // buat nama file unik
        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = fileName;

        // unggah file ke Supabase
        const { data, error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET_NAME)
          .upload(filePath, fileToUpload, {
            cacheControl: "3600",
            upsert: false,
          });

        // jika ada error tampilkan error
        if (uploadError) {
          throw uploadError;
        }

        // tambahkan URL publik ke daftar foto
        uploadedCount++;
      } catch (err) {
        tempErrors.push(`Gagal mengunggah '${file.name}': ${err.message}`);
      }
    }

    // reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // jika berhasil
    if (uploadedCount > 0) {
      setMessage(`Berhasil mengunggah ${uploadedCount} foto!`);
    }

    // jika ada error
    if (tempErrors.length > 0) {
      setError(tempErrors.join("\n"));
    } else if (uploadedCount === 0 && tempErrors.length === 0) {
      setError("Tidak ada foto yang berhasil diunggah.");
    }

    // panggil ulang untuk memuat daftar foto terbaru
    await fetchFoto();
    setUploading(false);

    // hapus pesan setelah 5 detik
    setTimeout(() => {
      setMessage("");
      setError(null);
    }, 5000);
  };

  // Fungsi untuk menampilkan modal konfirmasi hapus satu per satu
  const confirmDelete = (fotoUrl) => {
    setFotoToDelete(fotoUrl);
    setShowDeleteModal(true);
  };

  // Fungsi untuk menghapus foto dari Supabase Storage (satu per satu)
  const handleDeleteFoto = async () => {
    // pastikan foto yang akan dihapus ada
    if (!fotoToDelete) return;

    setLoadingFotos(true);
    setShowDeleteModal(false);

    try {
      // ambil nama file dari URL
      const urlParts = fotoToDelete.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // hapus file dari Supabase
      const { data, error: deleteError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .remove([fileName]);

      // jika ada error
      if (deleteError) {
        throw deleteError;
      }

      setMessage("Foto berhasil dihapus!");
      setFotoToDelete(null);

      // panggil fungsi fetchFoto untuk memuat daftar foto terbaru
      await fetchFoto();
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

  // Menampilkan modal konfirmasi hapus semua
  const confirmDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  // Menghapus SEMUA foto dari Supabase Storage
  const handleDeleteAllFotos = async () => {
    // pastikan ada foto yang akan dihapus
    if (availableFotos.length === 0) {
      setMessage("Tidak ada foto untuk dihapus.");
      setShowDeleteAllModal(false);
      return;
    }

    setDeletingAll(true);
    setShowDeleteAllModal(false);
    setMessage("");
    setError(null);

    try {
      // Dapatkan daftar nama file dari Supabase Storage
      // Supabase .list() hanya mengembalikan nama file, bukan URL penuh
      const { data: files, error: listError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .list("", { limit: 1000 }); // Batasi upload untuk menghindari terlalu banyak data jika ada ribuan file

      if (listError) {
        throw listError;
      }

      if (files.length === 0) {
        setMessage("Tidak ada foto di bucket untuk dihapus.");
        return;
      }

      // Buat array hanya berisi nama file
      const fileNamesToDelete = files.map((file) => file.name);

      // Lakukan penghapusan semua file
      const { data, error: removeError } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .remove(fileNamesToDelete);

      if (removeError) {
        throw removeError;
      }

      setMessage(`Berhasil menghapus ${fileNamesToDelete.length} foto!`);
      await fetchFoto(); // Refresh daftar foto setelah penghapusan
    } catch (err) {
      setError(`Gagal menghapus semua foto: ${err.message}`);
    } finally {
      setDeletingAll(false);
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
          <p className="text-center text-gray-500 py-4">Sabar coy..</p>
        )}
        {error && <p className="text-center text-red-500 py-4">{error}</p>}
        {!loadingFotos && !error && availableFotos.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Gak ada foto. Unggah dulu coy!
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {availableFotos.map((fotoUrl) => (
            <div
              key={fotoUrl}
              className="relative border-2 border-gray-200 rounded-md overflow-hidden shadow-sm w-full h-36"
            >
              <Image
                src={fotoUrl}
                alt={`Foto`}
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

        {/* Tombol Hapus Semua Foto - BARU */}
        {availableFotos.length > 0 && !loadingFotos && (
          <div className="mt-8 text-center">
            <button
              onClick={confirmDeleteAll}
              disabled={deletingAll}
              className={`
                px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300
                ${
                  deletingAll
                    ? "bg-red-400 opacity-60 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }
              `}
            >
              {deletingAll ? "Menghapus Semua..." : "Hapus Semua Foto"}
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal (untuk hapus satu per satu) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Konfirmasi Hapus Foto
            </h3>
            <p className="text-gray-600 mb-6">
              Lo yakin ingin menghapus foto ini?
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
                Gass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete All Confirmation Modal - BARU */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Konfirmasi Hapus Semua Foto
            </h3>
            <p className="text-red-600 font-bold mb-4">
              {availableFotos.length} foto bakal lo hapus!
            </p>
            <p className="text-gray-600 mb-6">Hapus apa kagak nih?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAllFotos}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Gass lah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
