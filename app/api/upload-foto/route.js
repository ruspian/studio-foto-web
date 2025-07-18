// app/api/upload-foto/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada file yang diunggah." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "foto");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedFileNames = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: `File '${file.name}' bukan format gambar yang didukung.` },
          { status: 400 }
        );
      }

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `Ukuran file '${file.name}' terlalu besar (maks 5MB).` },
          { status: 400 }
        );
      }

      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      uploadedFileNames.push(fileName);
    }

    console.log("Foto berhasil diunggah:", uploadedFileNames);

    return NextResponse.json(
      { message: "Foto berhasil diunggah!", files: uploadedFileNames },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat mengunggah foto:", error);
    return NextResponse.json(
      { message: "Gagal mengunggah foto.", error: error.message },
      { status: 500 }
    );
  }
}
