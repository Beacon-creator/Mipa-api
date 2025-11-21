import { Router } from "express";
import { prisma } from "../db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Env } from "../config/env";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hash },
    });

    // later: email verification / OTP
    const token = jwt.sign({ sub: user.id }, Env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ sub: user.id }, Env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
