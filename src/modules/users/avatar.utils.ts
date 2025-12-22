import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

/* ================= DELETE OLD ================= */

export async function deleteOldAvatar(avatarUrl?: string | null) {
  if (!avatarUrl) return;
  if (!avatarUrl.startsWith("/uploads/avatars/")) return;

  const filePath = path.join(process.cwd(), avatarUrl);

  try {
    await fs.unlink(filePath);
  } catch {
    // ignore missing file
  }
}

/* ================= PROCESS IMAGE ================= */

export async function processAvatar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) return next();

    const filePath = req.file.path;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      await fs.unlink(filePath);
      return res.status(400).json({ message: "Invalid image file" });
    }

    if (metadata.width < 128 || metadata.height < 128) {
      await fs.unlink(filePath);
      return res
        .status(400)
        .json({ message: "Image too small (min 128x128)" });
    }

    const tmpPath = filePath + ".tmp";

    await image
      .resize(512, 512, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toFile(tmpPath);

    await fs.rename(tmpPath, filePath);

    next();
  } catch (err) {
    next(err);
  }
}
