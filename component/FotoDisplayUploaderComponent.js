"use client";

import Image from "next/image";
import React, { useState } from "react";

const FotoDisplayUploaderComponent = ({ availableFotos }) => {
  const [loadingFotos, setLoadingFotos] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk menghapus foto
  const handleDeleteFoto = async (fotoUrl) => {
    if (!confirm(`Anda yakin ingin menghapus foto ini?\n${fotoUrl}`)) {
      return;
    }

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
          Tidak ada foto di server. Unggah beberapa!
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
              width={200}
              height={150}
              className="object-cover w-full h-28" // Adjust height as needed
            />
            <button
              onClick={() => handleDeleteFoto(fotoUrl)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs leading-none"
              title="Hapus Foto Ini"
            >
              &times; {/* Tanda 'x' */}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FotoDisplayUploaderComponent;
