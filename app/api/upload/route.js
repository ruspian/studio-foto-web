import { put, del, list } from "@vercel/blob";
import { NextResponse } from "next/server";

// Handler untuk permintaan GET / ambil gambar dari vercel blob
export async function GET(request) {
  try {
    const { blobs } = await list();

    const fotoUrls = blobs.map((blob) => blob.url);

    return NextResponse.json(fotoUrls, { status: 200 });
  } catch (error) {
    console.error("Error fetching blobs from Vercel:", error);
    return NextResponse.json(
      { message: "Gagal memuat foto dari Blob.", error: error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk upload gambar ke vercel blob
export const PUT = async (req) => {
  try {
    // ambil data dari form
    const form = await req.formData();

    // ambil file gambar saja
    const file = form.get("file");

    //  cek apakah file kosong
    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: "File is required!" },
        { status: 400 }
      );
    }

    //  cek apakah file lebih besar dari 4MB
    if (file.size > 4 * 1024 * 1024) {
      // 4MB
      return NextResponse.json(
        { message: "Ukuran file maksimal adalah 4MB!" },
        { status: 400 }
      );
    }

    //  cek apakah file adalah gambar
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File harus berupa gambar!" },
        { status: 400 }
      );
    }

    // Generate nama file unik untuk mencegah konflik
    const filename = `${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9.]/g,
      "_"
    )}`;

    // simpan gambar ke vercel blob
    const blob = await put(filename, file, {
      access: "public",
      multipart: true, // Untuk memastikan ini bekerja dengan FormData
    });

    console.log("File uploaded to Vercel Blob:", blob);
    return NextResponse.json(blob, { status: 200 });
  } catch (error) {
    console.error("Error during Blob PUT upload:", error);
    return NextResponse.json(
      { message: "Gagal mengunggah gambar.", error: error.message },
      { status: 500 }
    );
  }
};

// Fungsi untuk menghapus gambar dari vercel
export const DELETE = async (req) => {
  try {
    // ambil gambar
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { message: "URL gambar tidak disediakan!" },
        { status: 400 }
      );
    }

    // hapus gambar
    await del(imageUrl);

    console.log("File deleted from Vercel Blob:", imageUrl);
    return NextResponse.json(
      { message: "Gambar berhasil dihapus!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during Blob DELETE:", error);
    return NextResponse.json(
      { message: "Gagal menghapus gambar.", error: error.message },
      { status: 500 }
    );
  }
};
