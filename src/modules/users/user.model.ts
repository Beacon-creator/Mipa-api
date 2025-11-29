// src/modules/users/user.model.ts

import { Schema, model, Document, Model } from "mongoose";

export interface IPaymentMethod {
  type: "card" | "wallet" | "bank";
  brand?: string;      // e.g. "Visa"
  last4?: string;      // e.g. "4242"
  isDefault?: boolean;
}

export interface IAddress {
  _id?: string;        // subdocument id, used in controllers
  label?: string;      // "Home", "Office"
  line1: string;       // e.g. "12 Adeola St"
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

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
  phone?: string;
  avatarUrl?: string;
  paymentMethods?: IPaymentMethod[];
  addresses?: IAddress[];
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    type: { type: String, enum: ["card", "wallet", "bank"], required: true },
    brand: { type: String },
    last4: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

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
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    paymentMethods: { type: [PaymentMethodSchema], default: [] },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.passwordHash;
  },
});

export const User = model<IUserDocument, IUserModel>("User", UserSchema);
