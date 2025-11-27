import { Schema, model, Document, Model } from "mongoose";

export interface IRestaurant {
  name: string;
  description?: string;
  imageUrl?: string;
  // e.g. "Ikeja, Lagos", "VI, Lagos"
  location: string;
  // distance from user in km (you can compute this later or store approximate)
  distanceKm?: number;
  // average rating 0–5
  rating: number;
  // category tags: "food", "drink", "cake", "snacks", etc.
  categories: string[];
  // 1 = cheap, 4 = expensive
  priceLevel?: number;
}

export interface IRestaurantDocument extends IRestaurant, Document {}
export interface IRestaurantModel extends Model<IRestaurantDocument> {}

const RestaurantSchema = new Schema<IRestaurantDocument>(
  {
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
  },
  { timestamps: true }
);

RestaurantSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret: any) {
    ret.id = ret._id?.toString();
    delete ret._id;
  },
});

export const Restaurant = model<IRestaurantDocument, IRestaurantModel>(
  "Restaurant",
  RestaurantSchema
);
