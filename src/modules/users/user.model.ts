import { Schema, model, Document, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string | null;
  emailVerificationCodeExpiresAt?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiresAt?: Date | null;
  location?: string;
}

// The actual document type stored in Mongo
export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: null },
    emailVerificationCodeExpiresAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

// Clean JSON representation: add string id, remove _id and __v
UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

export const User = model<IUserDocument, IUserModel>("User", UserSchema);
