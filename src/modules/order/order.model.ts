import { Schema, model, Document, Model, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;       // snapshot of menu name
  price: number;      // snapshot of unit price
  quantity: number;
  subtotal: number;
}

export interface IAddress {
  fullName?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface IOrder {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;      // "card", "cash", "wallet", etc.
  totalAmount: number;
  address?: IAddress;
  notes?: string;
  orderNumber: string;
}

export interface IOrderDocument extends IOrder, Document {}
export interface IOrderModel extends Model<IOrderDocument> {}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const AddressSchema = new Schema<IAddress>(
  {
    fullName: String,
    phone: String,
    line1: { type: String, required: true },
    line2: String,
    city: String,
    state: String,
    postalCode: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

OrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

export const Order = model<IOrderDocument, IOrderModel>("Order", OrderSchema);
