// scripts/seed.ts
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Restaurant } from "../src/modules/restaurants/restaurant.model";
import { MenuItem } from "../src/modules/menu/menuItem.model";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/mipa";
const WIPE = process.env.SEED_WIPE === "true";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  try {
    if (WIPE) {
      await Promise.all([
        Restaurant.deleteMany({}),
        MenuItem.deleteMany({}),
      ]);
      console.log("🧹 Database wiped");
    }

    /* ==========RESTAURANTS============ */

    const restaurantsData = [
      {
        name: "Mama's Kitchen",
        description: "Homestyle Nigerian meals made with love",
        imageUrl: "https://tinyurl.com/naijameal",
        location: "Ikeja, Lagos",
        distanceKm: 0.5,
        rating: 4.7,
        categories: ["food", "snacks"],
        priceLevel: 2,
      },
      {
        name: "Café Bella",
        description: "Fresh coffee and bakery treats",
        imageUrl: "https://tinyurl.com/coffeebakery",
        location: "Victoria Island, Lagos",
        distanceKm: 1.2,
        rating: 4.6,
        categories: ["drink", "cake"],
        priceLevel: 3,
      },
      {
        name: "Green Bowl",
        description: "Healthy bowls and salads",
        imageUrl: "https://tinyurl.com/healthybowlmipa",
        location: "Lekki Phase 1",
        distanceKm: 2.1,
        rating: 4.8,
        categories: ["salad", "food"],
        priceLevel: 3,
      },
      {
        name: "Street Bites",
        description: "Fast street food & grills",
        imageUrl: "https://tinyurl.com/streetfoodmipa",
        location: "Yaba, Lagos",
        distanceKm: 0.9,
        rating: 4.4,
        categories: ["snacks", "food"],
        priceLevel: 1,
      },
    ];

    const createdRestaurants = await Restaurant.create(restaurantsData);
    console.log(`🍽️  Inserted ${createdRestaurants.length} restaurants`);

    /* ================================
       RESTAURANT ID MAP (KEY PART)
    ================================= */

    const restaurantIdMap = new Map<string, string>();
    createdRestaurants.forEach((r: any) => {
      restaurantIdMap.set(r.name, r._id.toString());
      console.log(`- ${r.name} → ${r._id}`);
    });

    /* ================================
       MENU ITEMS (USE restaurantName)
    ================================= */

    const menuItemsData = [
      // Mama's Kitchen
      {
        restaurantName: "Mama's Kitchen",
        name: "Jollof Rice & Chicken",
        description: "Smoky jollof rice with crispy chicken",
        imageUrl: "https://tinyurl.com/jollofchicken",
        price: 1200,
        type: "food",
        isAvailable: true,
        tags: ["popular", "spicy"],
      },
      {
        restaurantName: "Mama's Kitchen",
        name: "Fried chops",
        description: "Sweet small chops",
        imageUrl: "https://tinyurl.com/smallchops",
        price: 300,
        type: "snacks",
        isAvailable: true,
        tags: ["side"],
      },

      // Café Bella
      {
        restaurantName: "Café Bella",
        name: "Latte (Medium)",
        description: "Creamy latte with rich espresso",
        imageUrl: "https://tinyurl.com/lattemipa",
        price: 800,
        type: "drink",
        isAvailable: true,
        tags: ["coffee"],
      },
      {
        restaurantName: "Café Bella",
        name: "Blueberry Muffin",
        description: "Soft muffin filled with blueberries",
        imageUrl: "https://tinyurl.com/bberrymuffin",
        price: 450,
        type: "cake",
        isAvailable: true,
        tags: ["bakery"],
      },

      // Green Bowl
      {
        restaurantName: "Green Bowl",
        name: "Chicken Power Bowl",
        description: "Grilled chicken with quinoa & veggies",
        imageUrl: "https://tinyurl.com/chickenbowlmipa",
        price: 1800,
        type: "food",
        isAvailable: true,
        tags: ["healthy", "protein"],
      },
      {
        restaurantName: "Green Bowl",
        name: "Avocado Smoothie",
        description: "Fresh avocado blended smoothie",
        imageUrl: "https://tinyurl.com/avocadosmoothiemipa",
        price: 1000,
        type: "drink",
        isAvailable: true,
        tags: ["healthy"],
      },

      // Street Bites
      {
        restaurantName: "Street Bites",
        name: "Suya Wrap",
        description: "Spicy beef suya",
        imageUrl: "https://tinyurl.com/suyamipa",
        price: 900,
        type: "food",
        isAvailable: true,
        tags: ["spicy"],
      },
      {
        restaurantName: "Street Bites",
        name: "Grilled Corn",
        description: "Charcoal grilled sweet corn",
        imageUrl: "https://tinyurl.com/grilledcornmipa",
        price: 300,
        type: "snacks",
        isAvailable: true,
        tags: ["street"],
      },
    ];

    // ====== MENU ITEM IDs

    const menuItemsToInsert = menuItemsData.map((item) => {
      const restaurantId = restaurantIdMap.get(item.restaurantName);

      if (!restaurantId) {
        throw new Error(
          `Restaurant not found for menu item: ${item.name}`
        );
      }

      return {
        restaurant: restaurantId, // MongoDB ID
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        type: item.type,
        isAvailable: item.isAvailable,
        tags: item.tags,
      };
    });

    const createdMenuItems = await MenuItem.create(menuItemsToInsert);
    console.log(` Inserted ${createdMenuItems.length} menu items`);

    console.log(" SEED COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error(" Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
