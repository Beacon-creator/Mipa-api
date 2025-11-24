import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  location?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
