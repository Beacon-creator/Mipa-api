import express from "express";
import cors from "cors";
import { Env } from "./config/env";
import { prisma } from "./db/client";
import authRouter from "./routes/auth";
import restaurantsRouter from "./routes/restaurants";
import ordersRouter from "./routes/orders";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Mipa API is running" });
});

app.use("/auth", authRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/orders", ordersRouter);

app.listen(Env.PORT, () => {
  console.log(`Mipa API listening on port ${Env.PORT}`);
});

// optional: handle SIGINT to close Prisma
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
