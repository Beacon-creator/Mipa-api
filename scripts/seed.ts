// scripts/seed.ts
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
// IMPORTANT: adjust these relative imports if your repo layout differs.
// This assumes models are at backendAPI/mipa-api/src/modules/...
import { Restaurant } from "../src/modules/restaurants/restaurant.model";
import { MenuItem } from "../src/modules/menu/menuItem.model";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mipa";
const WIPE = process.env.SEED_WIPE === "true";

async function main() {
  await mongoose.connect(MONGO_URI, {});

  try {
    if (WIPE) {
      await Promise.all([Restaurant.deleteMany({}), MenuItem.deleteMany({})]);
    }

    const restaurantsData = [
      {
        name: "Mama's Kitchen",
        description: "Homestyle meals made with love",
        imageUrl: "https://picsum.photos/seed/mama/800/600",
        location: "Ikeja, Lagos",
        distanceKm: 0.5,
        rating: 4.7,
        categories: ["food", "snacks"],
        priceLevel: 2,
      },
      {
        name: "Café Bella",
        description: "Fresh coffee and bakery treats",
        imageUrl: "https://picsum.photos/seed/bella/800/600",
        location: "Victoria Island, Lagos",
        distanceKm: 1.2,
        rating: 4.6,
        categories: ["drink", "cake"],
        priceLevel: 3,
      },
    ];

    const createdRestaurants = await Restaurant.create(restaurantsData);

    (createdRestaurants as any[]).forEach((r: any) =>
      console.log(`- ${r.name}  id=${r._id?.toString()}`)
    );

    const mamaId = (createdRestaurants as any[])[0]._id.toString();
    const bellaId = (createdRestaurants as any[])[1]._id.toString();

    const menuItemsData = [
      {
        restaurant: mamaId,
        name: "Jollof Rice & Chicken",
        description: "Spicy jollof rice served with fried chicken",
        imageUrl: "https://picsum.photos/seed/jollof/600/400",
        price: 1200,
        type: "food",
        isAvailable: true,
        tags: ["spicy", "popular"],
      },
      {
        restaurant: mamaId,
        name: "Fried Plantain (Dodo)",
        description: "Sweet fried plantain",
        imageUrl: "https://picsum.photos/seed/plantain/600/400",
        price: 300,
        type: "snacks",
        isAvailable: true,
        tags: ["side"],
      },
      {
        restaurant: bellaId,
        name: "Latte (Medium)",
        description: "Creamy latte with fresh espresso",
        imageUrl: "https://picsum.photos/seed/latte/600/400",
        price: 800,
        type: "drink",
        isAvailable: true,
        tags: ["coffee"],
      },
      {
        restaurant: bellaId,
        name: "Blueberry Muffin",
        description: "Soft muffin with juicy blueberries",
        imageUrl: "https://picsum.photos/seed/muffin/600/400",
        price: 450,
        type: "cake",
        isAvailable: true,
        tags: ["bakery"],
      },
    ];

    const createdMenu = await MenuItem.create(menuItemsData);
    (createdMenu as any[]).forEach((m: any) =>
      console.log(`- ${m.name}  id=${m._id?.toString()}  restaurant=${m.restaurant?.toString()}`)
    );
  } catch (err) {
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main().catch((err) => {
  process.exit(1);
});
