"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = getMeHandler;
exports.updateProfileHandler = updateProfileHandler;
exports.updateEmailHandler = updateEmailHandler;
exports.updatePasswordHandler = updatePasswordHandler;
exports.getPaymentSettingsHandler = getPaymentSettingsHandler;
exports.updatePaymentSettingsHandler = updatePaymentSettingsHandler;
exports.contactUsHandler = contactUsHandler;
exports.requestEmailChangeHandler = requestEmailChangeHandler;
exports.confirmEmailChangeHandler = confirmEmailChangeHandler;
exports.listAddressesHandler = listAddressesHandler;
exports.upsertAddressHandler = upsertAddressHandler;
exports.deleteAddressHandler = deleteAddressHandler;
exports.setDefaultAddressHandler = setDefaultAddressHandler;
exports.uploadAvatarHandler = uploadAvatarHandler;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("./user.model");
const otp_1 = require("../../utils/otp");
const avatar_utils_1 = require("./avatar.utils");
function getUserId(req) {
    return req.userId ?? null; // set by auth.middleware
}
function toUserDTO(user) {
    return {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        location: user.location,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
    };
}
// GET /api/users/me
async function getMeHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(userId).select("-passwordHash");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/users/me/profile
// body: { name?, location?, phone?, avatarUrl? }
async function updateProfileHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { name, location, phone, avatarUrl } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (location !== undefined)
            updates.location = location;
        if (phone !== undefined)
            updates.phone = phone;
        if (avatarUrl !== undefined)
            updates.avatarUrl = avatarUrl;
        const user = await user_model_1.User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-passwordHash");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/users/me/email
// body: { email }
async function updateEmailHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });
        // Simple direct update; you already have OTP flows in auth module for signup
        const existing = await user_model_1.User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const user = await user_model_1.User.findByIdAndUpdate(userId, { email: email.toLowerCase() }, { new: true, runValidators: true }).select("-passwordHash");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/users/me/password
// body: { currentPassword, newPassword }
async function updatePasswordHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both currentPassword and newPassword are required" });
        }
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const ok = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!ok)
            return res.status(400).json({ message: "Current password is incorrect" });
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/users/me/payment-settings
async function getPaymentSettingsHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(userId).select("paymentMethods");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ paymentMethods: user.paymentMethods ?? [] });
    }
    catch (err) {
        next(err);
    }
}
// PATCH /api/users/me/payment-settings
// body: { paymentMethods: IPaymentMethod[] }
async function updatePaymentSettingsHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { paymentMethods } = req.body;
        if (!Array.isArray(paymentMethods)) {
            return res.status(400).json({ message: "paymentMethods must be an array" });
        }
        const user = await user_model_1.User.findByIdAndUpdate(userId, { paymentMethods }, { new: true, runValidators: true }).select("paymentMethods");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ paymentMethods: user.paymentMethods ?? [] });
    }
    catch (err) {
        next(err);
    }
}
async function contactUsHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: "subject and message are required" });
        }
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
/**
 * EMAIL CHANGE WITH OTP (no real email, just returns the code)
 */
// POST /api/users/me/email/change/request
// body: { newEmail }
async function requestEmailChangeHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { newEmail } = req.body;
        if (!newEmail) {
            return res.status(400).json({ message: "newEmail is required" });
        }
        const normalized = newEmail.toLowerCase();
        const existing = await user_model_1.User.findOne({ email: normalized, _id: { $ne: userId } });
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const code = (0, otp_1.generateOTP)();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.emailVerificationCode = code;
        user.emailVerificationCodeExpiresAt = expires;
        await user.save();
        // In production you'd send an email. For now, return the code.
        res.json({
            ok: true,
            verificationCode: code,
            newEmail: normalized,
        });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/users/me/email/change/confirm
// body: { newEmail, code }
async function confirmEmailChangeHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { newEmail, code } = req.body;
        if (!newEmail || !code) {
            return res.status(400).json({ message: "newEmail and code are required" });
        }
        const normalized = newEmail.toLowerCase();
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.emailVerificationCode || !user.emailVerificationCodeExpiresAt) {
            return res.status(400).json({ message: "No verification code on file" });
        }
        const now = new Date();
        if (user.emailVerificationCodeExpiresAt < now) {
            return res.status(400).json({ message: "Verification code expired" });
        }
        if (user.emailVerificationCode !== code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        // Check again that email isn't used by someone else (safety)
        const existing = await user_model_1.User.findOne({ email: normalized, _id: { $ne: userId } });
        if (existing) {
            return res.status(400).json({ message: "Email already in use" });
        }
        user.email = normalized;
        user.isEmailVerified = true;
        user.emailVerificationCode = null;
        user.emailVerificationCodeExpiresAt = null;
        await user.save();
        res.json({ user: toUserDTO(user) });
    }
    catch (err) {
        next(err);
    }
}
/**
 * ADDRESS MANAGEMENT
 */
// GET /api/users/me/addresses
async function listAddressesHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await user_model_1.User.findById(userId).select("addresses");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ addresses: user.addresses ?? [] });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/users/me/addresses
// body: { id?, label?, line1, line2?, city, state?, postalCode?, country?, isDefault? }
// if id present → update that address; else create new
async function upsertAddressHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { id, label, line1, line2, city, state, postalCode, country, isDefault, } = req.body;
        if (!line1 || !city) {
            return res.status(400).json({ message: "line1 and city are required" });
        }
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        let addressDoc;
        if (id) {
            // update existing
            addressDoc = user.addresses?.find((a) => a._id?.toString() === id);
            if (!addressDoc) {
                return res.status(404).json({ message: "Address not found" });
            }
            if (label !== undefined)
                addressDoc.label = label;
            if (line1 !== undefined)
                addressDoc.line1 = line1;
            if (line2 !== undefined)
                addressDoc.line2 = line2;
            if (city !== undefined)
                addressDoc.city = city;
            if (state !== undefined)
                addressDoc.state = state;
            if (postalCode !== undefined)
                addressDoc.postalCode = postalCode;
            if (country !== undefined)
                addressDoc.country = country;
            if (isDefault !== undefined)
                addressDoc.isDefault = isDefault;
        }
        else {
            // create new
            addressDoc = {
                label,
                line1,
                line2,
                city,
                state,
                postalCode,
                country,
                isDefault: !!isDefault,
            };
            user.addresses = user.addresses ?? [];
            user.addresses.push(addressDoc);
        }
        // Ensure only one default
        if (addressDoc.isDefault) {
            user.addresses.forEach((a) => {
                if (a._id?.toString() !== addressDoc._id?.toString()) {
                    a.isDefault = false;
                }
            });
        }
        await user.save();
        res.json({ addresses: user.addresses });
    }
    catch (err) {
        next(err);
    }
}
// DELETE /api/users/me/addresses/:addressId
async function deleteAddressHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { addressId } = req.params;
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const addr = user.addresses?.find((a) => a._id?.toString() === addressId);
        if (!addr) {
            return res.status(404).json({ message: "Address not found" });
        }
        // Remove the address from the array instead of calling deleteOne on the interface
        user.addresses = user.addresses?.filter((a) => a._id?.toString() !== addressId) ?? [];
        await user.save();
        res.json({ addresses: user.addresses });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/users/me/addresses/:addressId/default
async function setDefaultAddressHandler(req, res, next) {
    try {
        const userId = getUserId(req);
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { addressId } = req.params;
        const user = await user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const addr = user.addresses?.find((a) => a._id?.toString() === addressId);
        if (!addr) {
            return res.status(404).json({ message: "Address not found" });
        }
        user.addresses.forEach((a) => {
            a.isDefault = a._id?.toString() === addressId;
        });
        await user.save();
        res.json({ addresses: user.addresses });
    }
    catch (err) {
        next(err);
    }
}
// POST /api/users/me/avatar
async function uploadAvatarHandler(req, res, next) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await (0, avatar_utils_1.deleteOldAvatar)(user.avatarUrl);
        user.avatarUrl = avatarUrl;
        await user.save();
        res.json({ avatarUrl });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=user.controller.js.map