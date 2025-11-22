import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    location: { type: String }, // e.g. "Ikeja"
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model<User>("User", userSchema);
