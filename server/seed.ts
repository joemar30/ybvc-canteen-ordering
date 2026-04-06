import { dbInit, run } from "./db.js";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Initializing database...");
  await dbInit();

  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  console.log("Seeding users...");
  await run("users", "delete", {}, () => true);

  await run("users", "insert", {
    id: "admin-1",
    name: "Canteen Admin",
    email: "admin@ybvc.edu",
    password: adminPassword,
    role: "admin",
    created_at: new Date().toISOString()
  });

  await run("users", "insert", {
    id: "student-1",
    name: "John Student",
    email: "student@ybvc.edu",
    password: hashedPassword,
    role: "customer",
    loyalty_points: 50,
    total_spent: 0,
    tier: "Bronze",
    created_at: new Date().toISOString()
  });

  console.log("Seeding products...");
  await run("products", "delete", {}, () => true);

  const products = [
    /* ── Espresso ── */
    { id: "p1",  name: "Single Shot Espresso",   description: "Bold and intense single shot of freshly pulled espresso with a rich crema", price: 45, category: "Espresso", roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p2",  name: "Double Shot Espresso",   description: "Rich double shot for those who need an extra kick — smooth yet powerful",   price: 65, category: "Espresso", roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    /* ── Brewed ── */
    { id: "p3",  name: "Americano",              description: "Espresso shots topped with hot water for a smooth, full-bodied cup",        price: 55, category: "Brewed",   roast_level: "Medium", image_url: "https://images.unsplash.com/photo-1574914629385-46448b212566?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p4",  name: "Cappuccino",             description: "Creamy blend of espresso, steamed milk, and velvety microfoam",            price: 75, category: "Brewed",   roast_level: "Medium", image_url: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p5",  name: "Latte",                  description: "Smooth and creamy espresso with silky steamed milk and light foam",         price: 75, category: "Brewed",   roast_level: "Light",  image_url: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p6",  name: "Flat White",             description: "Velvety microfoam over a ristretto base — a café staple from Down Under",  price: 80, category: "Brewed",   roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p7",  name: "Pour Over",              description: "Hand-poured drip coffee, bright and clean with floral or fruity notes",    price: 85, category: "Brewed",   roast_level: "Light",  image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    /* ── Iced Coffee ── */
    { id: "p8",  name: "Iced Americano",         description: "Refreshing cold espresso over ice and water — crisp and energizing",       price: 60, category: "Iced Coffee", roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p9",  name: "Iced Latte",             description: "Creamy cold latte over ice — perfect for warm afternoons",                 price: 80, category: "Iced Coffee", roast_level: "Light",  image_url: "https://images.unsplash.com/photo-1571658735898-97c4e45db440?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p10", name: "Cold Brew",              description: "Steeped 12 hours in cold water — ultra-smooth with zero bitterness",       price: 90, category: "Iced Coffee", roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    /* ── Specialty Drinks ── */
    { id: "p11", name: "Caramel Macchiato",      description: "Vanilla syrup, steamed milk, espresso, and drizzled caramel on top",      price: 95, category: "Specialty Drinks", roast_level: "Medium", image_url: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p12", name: "Mocha",                  description: "Rich espresso with chocolate sauce and steamed milk — dessert in a cup",   price: 95, category: "Specialty Drinks", roast_level: "Dark",   image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p13", name: "Caramel Frappe",         description: "Blended iced coffee with caramel, milk, and whipped cream topping",       price: 110, category: "Specialty Drinks", roast_level: "Medium", image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p14", name: "Matcha Latte",           description: "Premium ceremonial-grade matcha with steamed oat milk — earthy and sweet", price: 95, category: "Specialty Drinks", roast_level: "N/A",    image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    /* ── Non-Coffee ── */
    { id: "p15", name: "Hot Chocolate",          description: "Rich Belgian cocoa with creamy steamed milk — warm and comforting",        price: 70, category: "Non-Coffee", roast_level: "N/A",    image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
    { id: "p16", name: "Vanilla Milk Tea",       description: "Smooth milk tea with real vanilla extract and pearl tapioca boba",        price: 80, category: "Non-Coffee", roast_level: "N/A",    image_url: "https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=400&h=400&auto=format&fit=crop", is_available: true },
  ];

  for (const product of products) {
    await run("products", "insert", { ...product, created_at: new Date().toISOString() });
  }

  console.log("Seeding pickup slots...");
  await run("pickup_slots", "delete", {}, () => true);

  const slots = [
    { id: "slot-1", time: "08:00 AM", capacity: 10, reserved: 0, available: true },
    { id: "slot-2", time: "08:30 AM", capacity: 10, reserved: 0, available: true },
    { id: "slot-3", time: "09:00 AM", capacity: 10, reserved: 0, available: true },
    { id: "slot-4", time: "09:30 AM", capacity: 10, reserved: 0, available: true },
    { id: "slot-5", time: "10:00 AM", capacity: 10, reserved: 0, available: true },
    { id: "slot-6", time: "12:00 PM", capacity: 15, reserved: 0, available: true },
    { id: "slot-7", time: "12:30 PM", capacity: 15, reserved: 0, available: true },
    { id: "slot-8", time: "01:00 PM", capacity: 15, reserved: 0, available: true },
    { id: "slot-9", time: "03:00 PM", capacity: 10, reserved: 0, available: true },
    { id: "slot-10", time: "03:30 PM", capacity: 10, reserved: 0, available: true },
  ];

  for (const slot of slots) {
    await run("pickup_slots", "insert", slot);
  }

  console.log("Database seeded successfully!");
  console.log("Login credentials:");
  console.log("  Admin: admin@ybvc.edu / admin123");
  console.log("  Student: student@ybvc.edu / password123");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
