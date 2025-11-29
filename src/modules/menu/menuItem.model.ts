import { Schema, model, Document, Model, Types } from "mongoose";

export interface IMenuItem {
  restaurant: Types.ObjectId;              // FK → Restaurant._id
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  // e.g. "food", "drink", "cake", "snacks" → to match your Home categories
  type: string;
  isAvailable: boolean;
  // optional tags like "spicy", "vegan", etc.
  tags?: string[];
}

export interface IMenuItemDocument extends IMenuItem, Document {}
export interface IMenuItemModel extends Model<IMenuItemDocument> {}

const MenuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

MenuItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

export const MenuItem = model<IMenuItemDocument, IMenuItemModel>(
  "MenuItem",
  MenuItemSchema
);
