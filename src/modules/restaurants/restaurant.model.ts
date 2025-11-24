import mongoose, { Schema, InferSchemaType } from "mongoose";

const restaurantSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },  // "Ikeja"
    distance: { type: Number, required: true },  // in km
    rating: { type: Number, default: 4.5 },
    imageUrl: { type: String },
    // later you can embed menu items or reference them
  },
  { timestamps: true }
);

export type Restaurant = InferSchemaType<typeof restaurantSchema>;
export const RestaurantModel = mongoose.model<Restaurant>("Restaurant", restaurantSchema);
