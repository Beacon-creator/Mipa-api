"use strict";
// src/modules/users/user.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const PaymentMethodSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["card", "wallet", "bank"], required: true },
    brand: { type: String },
    last4: { type: String },
    isDefault: { type: Boolean, default: false },
}, { _id: false });
const AddressSchema = new mongoose_1.Schema({
    label: { type: String },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    isDefault: { type: Boolean, default: false },
}, { _id: true });
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
UserSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.passwordHash;
    },
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
//# sourceMappingURL=user.model.js.map