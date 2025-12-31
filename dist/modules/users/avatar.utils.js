"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldAvatar = deleteOldAvatar;
exports.processAvatar = processAvatar;
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/* ================= DELETE OLD ================= */
async function deleteOldAvatar(avatarUrl) {
    if (!avatarUrl)
        return;
    if (!avatarUrl.startsWith("/uploads/avatars/"))
        return;
    const filePath = path_1.default.join(process.cwd(), avatarUrl);
    try {
        await promises_1.default.unlink(filePath);
    }
    catch {
        // ignore missing file
    }
}
/* ================= PROCESS IMAGE ================= */
async function processAvatar(req, res, next) {
    try {
        if (!req.file)
            return next();
        const filePath = req.file.path;
        const image = (0, sharp_1.default)(filePath);
        const metadata = await image.metadata();
        if (!metadata.width || !metadata.height) {
            await promises_1.default.unlink(filePath);
            return res.status(400).json({ message: "Invalid image file" });
        }
        if (metadata.width < 128 || metadata.height < 128) {
            await promises_1.default.unlink(filePath);
            return res
                .status(400)
                .json({ message: "Image too small (min 128x128)" });
        }
        const tmpPath = filePath + ".tmp";
        await image
            .resize(512, 512, { fit: "cover", position: "center" })
            .jpeg({ quality: 80 })
            .toFile(tmpPath);
        await promises_1.default.rename(tmpPath, filePath);
        next();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=avatar.utils.js.map