import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

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


export async function processAvatar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) return next();

    const inputPath = req.file.path;
    const outputPath = inputPath; // overwrite

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Dimension validation
    if (!metadata.width || !metadata.height) {
      await fs.unlink(inputPath);
      return res.status(400).json({ message: "Invalid image" });
    }

    if (metadata.width < 128 || metadata.height < 128) {
      await fs.unlink(inputPath);
      return res.status(400).json({
        message: "Image too small (min 128x128)",
      });
    }

    // Resize + compress
    await image
      .resize(512, 512, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath + ".tmp");

    // Replace original
    await fs.rename(outputPath + ".tmp", outputPath);

    next();
  } catch (err) {
    next(err);
  }
}