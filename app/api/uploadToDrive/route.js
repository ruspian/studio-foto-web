// app/api/upload-to-drive/route.js
import { google } from "googleapis";
import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";

const KEYFILEPATH = path.join(process.cwd(), "keys", "gdrive.json");

// Pastikan SCOPES ini sudah diperbarui untuk akses Shared Drive jika Anda menggunakannya.
// Jika hanya My Drive (setelah mengatasi kuota), drive.file mungkin cukup.
// Untuk Shared Drive atau akses penuh:
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

export async function POST(request) {
  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: authClient });

    const photoDir = path.join(process.cwd(), "public", "foto");
    let filesInFolder = [];

    try {
      filesInFolder = await fs.readdir(photoDir);
      filesInFolder = filesInFolder.filter((name) =>
        /\.(jpg|jpeg|png)$/i.test(name)
      );
    } catch (readDirError) {
      if (readDirError.code === "ENOENT") {
        return new Response(
          JSON.stringify({
            message:
              "Folder public/foto tidak ditemukan atau kosong, tidak ada foto untuk diunggah.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw readDirError;
    }

    if (filesInFolder.length === 0) {
      return new Response(
        JSON.stringify({
          message: "Tidak ada foto di folder public/foto untuk diunggah.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const uploadResults = [];
    const failedDeletions = [];

    // GANTI DENGAN ID SHARED DRIVE ANDA jika menggunakan Shared Drive!
    const SHARED_DRIVE_ID = "ID_SHARED_DRIVE_ANDA_DI_SINI"; // <-- PASTE ID DI SINI

    for (const filename of filesInFolder) {
      const filePath = path.join(photoDir, filename);
      const fileExtension = filename.split(".").pop();
      const mimeType = `image/${
        fileExtension === "jpg" ? "jpeg" : fileExtension
      }`;

      try {
        const fileStream = fsSync.createReadStream(filePath);

        // Upload file
        const response = await drive.files.create({
          requestBody: {
            name: filename,
            mimeType: mimeType,
            // Tambahkan 'parents' jika mengunggah ke folder atau Shared Drive tertentu
            parents: [SHARED_DRIVE_ID], // Contoh untuk Shared Drive
          },
          media: {
            mimeType: mimeType,
            body: fileStream,
          },
          // Tambahkan ini jika mengunggah ke Shared Drive
          supportsAllDrives: true,
          // Minta field yang diperlukan untuk URL setelah upload
          fields: "id,webViewLink", // Request webViewLink field
        });

        // Setel izin file agar bisa diakses publik (opsional, tergantung kebutuhan)
        // HANYA LAKUKAN INI JIKA ANDA INGIN SEMUA ORANG BISA MELIHAT FILE
        // Jika file hanya untuk diakses oleh anggota Shared Drive, abaikan bagian ini.
        try {
          await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
            fields: "id",
            // Tambahkan ini jika file di Shared Drive
            supportsAllDrives: true,
          });
          console.log(`Permission set for ${filename}.`);
        } catch (permissionError) {
          console.warn(
            `Gagal mengatur izin publik untuk ${filename}:`,
            permissionError.message
          );
          // Lanjutkan meskipun gagal mengatur izin
        }

        uploadResults.push({
          filename: filename,
          driveId: response.data.id,
          webViewLink: response.data.webViewLink, // Simpan URL yang dapat dilihat
          status: "uploaded",
        });

        try {
          await fs.unlink(filePath);
          console.log(`File ${filename} berhasil dihapus dari server.`);
        } catch (deleteErr) {
          console.error(
            `Gagal menghapus file ${filename} dari lokal setelah diunggah:`,
            deleteErr
          );
          failedDeletions.push(filename);
        }
      } catch (uploadErr) {
        console.error(
          `Gagal mengunggah file ${filename} ke Google Drive:`,
          uploadErr
        );
        uploadResults.push({
          filename: filename,
          status: "failed",
          error: uploadErr.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message:
          "Proses upload semua foto dari public/foto ke Google Drive selesai.",
        results: uploadResults,
        failedDeletions: failedDeletions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error dalam API upload-all-to-drive:", error);
    return new Response(
      JSON.stringify({
        message: "Terjadi kesalahan server saat memproses upload.",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
