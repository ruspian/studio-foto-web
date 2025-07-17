import fs from "fs";
import path from "path";

export async function GET() {
  const folderPath = path.join(process.cwd(), "public/foto");
  const files = fs.existsSync(folderPath)
    ? fs.readdirSync(folderPath).filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    : [];

  return Response.json({ files });
}
