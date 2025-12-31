"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
const mongoose_1 = require("mongoose");
const RestaurantSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    location: { type: String, required: true, trim: true },
    distanceKm: { type: Number },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    categories: {
        type: [String],
        default: [],
        index: true,
    },
    priceLevel: { type: Number, min: 1, max: 4, default: 2 },
}, { timestamps: true });
RestaurantSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
    },
});
exports.Restaurant = (0, mongoose_1.model)("Restaurant", RestaurantSchema);
//# sourceMappingURL=restaurant.model.js.map