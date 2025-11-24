import { Request, Response } from "express";
import { UserModel } from "./user.model";

export async function getMeHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string; // improved typing later
  const user = await UserModel.findById(userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}
