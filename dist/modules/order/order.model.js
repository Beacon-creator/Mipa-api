"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderItemSchema = new mongoose_1.Schema({
    menuItem: { type: mongoose_1.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
}, { _id: false });
const AddressSchema = new mongoose_1.Schema({
    fullName: String,
    phone: String,
    line1: { type: String, required: true },
    line2: String,
    city: String,
    state: String,
    postalCode: String,
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    items: { type: [OrderItemSchema], required: true },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"],
        default: "pending",
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "refunded"],
        default: "unpaid",
    },
    paymentMethod: { type: String },
    totalAmount: { type: Number, required: true },
    address: AddressSchema,
    notes: { type: String },
    orderNumber: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });
OrderSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
    },
});
exports.Order = (0, mongoose_1.model)("Order", OrderSchema);
//# sourceMappingURL=order.model.js.map