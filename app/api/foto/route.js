import { readdirSync } from "fs";
import { join } from "path";

export async function GET() {
  const fotoPath = join(process.cwd(), "public", "foto");

  try {
    const files = readdirSync(fotoPath).filter((file) => file.endsWith(".jpg"));
    console.log(files);

    return Response.json(files);
  } catch (error) {
    return Response.json({ error: "Gagal membaca foto" }, { status: 500 });
  }
}
