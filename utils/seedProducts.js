// Fills the products collection with sample data for testing the UI.
// Run with: npm run seed
const mongoose = require("mongoose");
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Product = require("../models/product.model");

const IMG = "https://cdn.dummyjson.com/product-images";
const COVER = "https://covers.openlibrary.org/b/isbn";

const products = [
  // ---------- Electronics ----------
  {
    name: "MacBook Pro 14 Inch Space Grey",
    description: "14-inch laptop with a Liquid Retina XDR display, all-day battery life and a fast chip for coding, design and everyday work.",
    price: 169999,
    category: "Electronics",
    image: `${IMG}/laptops/apple-macbook-pro-14-inch-space-grey/1.webp`,
    stock: 8,
  },
  {
    name: "iPhone 13 Pro",
    description: "Smartphone with a 6.1-inch Super Retina display, triple camera system and long battery life.",
    price: 99999,
    category: "Electronics",
    image: `${IMG}/smartphones/iphone-13-pro/1.webp`,
    stock: 15,
  },
  {
    name: "Samsung Galaxy S7 Phone",
    description: "Android phone with a 5.1-inch AMOLED screen, 12MP camera and water resistance.",
    price: 18999,
    category: "Electronics",
    image: `${IMG}/smartphones/samsung-galaxy-s7/1.webp`,
    stock: 30,
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 20 hours of playback.",
    price: 4999,
    category: "Electronics",
    image: `${IMG}/mobile-accessories/apple-airpods-max-silver/1.webp`,
    stock: 25,
  },
  {
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled phones.",
    price: 1499,
    category: "Electronics",
    image: `${IMG}/mobile-accessories/apple-airpower-wireless-charger/1.webp`,
    stock: 0,
  },

  // ---------- Fashion ----------
  {
    name: "Blue & Black Check Shirt",
    description: "Slim-fit cotton check shirt, comfortable for office and casual wear.",
    price: 1299,
    category: "Fashion",
    image: `${IMG}/mens-shirts/blue-&-black-check-shirt/1.webp`,
    stock: 40,
  },
  {
    name: "Men Plaid Shirt",
    description: "Classic plaid shirt made from soft breathable fabric with a button-down collar.",
    price: 999,
    category: "Fashion",
    image: `${IMG}/mens-shirts/man-plaid-shirt/1.webp`,
    stock: 22,
  },
  {
    name: "Air Jordan 1 Red And Black",
    description: "Iconic high-top sneakers with a leather upper and cushioned sole.",
    price: 12999,
    category: "Fashion",
    image: `${IMG}/mens-shoes/nike-air-jordan-1-red-and-black/1.webp`,
    stock: 5,
  },
  {
    name: "Future Rider Trainers",
    description: "Lightweight retro-style running trainers for everyday comfort.",
    price: 5499,
    category: "Fashion",
    image: `${IMG}/mens-shoes/puma-future-rider-trainers/1.webp`,
    stock: 18,
  },

  // ---------- Books ----------
  {
    name: "Clean Code",
    description: "Robert C. Martin's handbook of agile software craftsmanship — how to write code that is easy to read and maintain.",
    price: 649,
    category: "Books",
    image: `${COVER}/9780132350884-L.jpg`,
    stock: 50,
  },
  {
    name: "Atomic Habits",
    description: "James Clear's practical guide to building good habits and breaking bad ones through tiny changes.",
    price: 499,
    category: "Books",
    image: `${COVER}/9780735211292-L.jpg`,
    stock: 60,
  },
  {
    name: "The Alchemist",
    description: "Paulo Coelho's novel about a shepherd boy who travels in search of his personal legend.",
    price: 299,
    category: "Books",
    image: `${COVER}/9780062316097-L.jpg`,
    stock: 35,
  },
  {
    name: "Effective Java",
    description: "Joshua Bloch's best practices for writing robust, efficient Java code.",
    price: 899,
    category: "Books",
    image: `${COVER}/9780134685991-L.jpg`,
    stock: 3,
  },

  // ---------- Home ----------
  {
    name: "Table Lamp",
    description: "Minimal bedside table lamp with a warm fabric shade.",
    price: 1799,
    category: "Home",
    image: `${IMG}/home-decoration/table-lamp/1.webp`,
    stock: 14,
  },
  {
    name: "Plant Pot",
    description: "Ceramic indoor plant pot with a drainage hole, perfect for succulents.",
    price: 449,
    category: "Home",
    image: `${IMG}/home-decoration/plant-pot/1.webp`,
    stock: 70,
  },
  {
    name: "Bedside Table African Cherry",
    description: "Solid wood bedside table with a drawer and an open shelf.",
    price: 6999,
    category: "Home",
    image: `${IMG}/furniture/bedside-table-african-cherry/1.webp`,
    stock: 6,
  },
  {
    name: "Electric Stove",
    description: "Compact single-burner electric stove for quick cooking.",
    price: 2499,
    category: "Home",
    image: `${IMG}/kitchen-accessories/electric-stove/1.webp`,
    stock: 12,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products`);
  } catch (err) {
    console.log("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
