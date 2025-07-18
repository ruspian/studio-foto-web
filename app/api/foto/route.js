import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Folder untuk menyimpan foto
const FOTO_DIR = path.join(process.cwd(), "public", "foto");

// Handler for GET requests
export async function GET(request) {
  try {
    // cek apakah folder ditemukan
    try {
      await fs.access(FOTO_DIR);
    } catch (e) {
      if (e.code === "ENOENT") {
        // jika folder tidak ditemukan
        return NextResponse.json([], { status: 200 });
      }
      throw e; // re-throw other errors
    }

    const files = await fs.readdir(FOTO_DIR);
    // Filter hanya file gambar
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    });
    return NextResponse.json(imageFiles, { status: 200 });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { message: "Failed to fetch photos.", error: error.message },
      { status: 500 }
    );
  }
}

// handler untuk DELETE request
export async function DELETE(request) {
  try {
    const { filename } = await request.json(); // terima filename dari body

    if (!filename) {
      return NextResponse.json(
        { message: "Filename not provided." },
        { status: 400 }
      );
    }

    const fotoPath = path.join(FOTO_DIR, filename); // FOTO_DIR ssudah global

    // cek apakah file ditemukan.
    try {
      await fs.access(fotoPath);
    } catch (e) {
      if (e.code === "ENOENT") {
        // jika file tidak ditemukan
        return NextResponse.json(
          { message: "File not found.", filename: filename },
          { status: 404 }
        );
      }
      throw e; // kirim error lain
    }

    await fs.unlink(fotoPath); // Hapus foto yang tersimpan

    return NextResponse.json(
      {
        message: `Photo '${filename}' successfully deleted.`,
        filename: filename,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete photo.", error: error.message },
      { status: 500 }
    );
  }
}
