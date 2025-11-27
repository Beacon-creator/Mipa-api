import { Request, Response } from "express";
import { User } from "./user.model";

export async function getMeHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string; // populated by auth.middleware
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}

export async function updateMeHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, location } = req.body as { name?: string; location?: string };

  const updates: any = {};
  if (typeof name === "string") updates.name = name.trim();
  if (typeof location === "string") updates.location = location.trim();

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  }).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}
