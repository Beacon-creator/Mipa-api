import { Schema, model, Document, Model, Types } from "mongoose";

export interface IMenuItem {
  restaurant: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  type: string;      // "food" | "drink" | "snacks" | etc
  isAvailable: boolean;
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
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    type: { type: String, required: true, index: true }, // category/type
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
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
