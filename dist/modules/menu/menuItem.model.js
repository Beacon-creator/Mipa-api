"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
const mongoose_1 = require("mongoose");
const MenuItemSchema = new mongoose_1.Schema({
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, index: true }, // "food" | "drink" | ...
    isAvailable: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
}, { timestamps: true });
MenuItemSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
    },
});
exports.MenuItem = (0, mongoose_1.model)("MenuItem", MenuItemSchema);
//# sourceMappingURL=menuItem.model.js.map