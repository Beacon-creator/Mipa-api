import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 4000;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
