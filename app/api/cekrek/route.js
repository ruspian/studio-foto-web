import { exec } from "child_process";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";

export async function GET() {
  const fotoPath = join(process.cwd(), "public", "foto");

  if (!existsSync(fotoPath)) {
    mkdirSync(fotoPath, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.]/g, "")
    .replace("T", "-")
    .slice(0, 15);

  const filename = join(fotoPath, `foto-${timestamp}.jpg`);

  return new Promise((resolve) => {
    exec(
      `gphoto2 --capture-image-and-download --keep --filename "${filename}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return resolve(
            Response.json(
              { error: "Gagal mengambil gambar", stderr },
              { status: 500 }
            )
          );
        }
        return resolve(
          Response.json({ message: "Berhasil ambil foto", stdout, filename })
        );
      }
    );
  });
}
