import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth.js";
import { dbInit, query, get, run } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await dbInit();

  const app = express();
  const server = createServer(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());

  // Auth Routes
  app.use("/api/auth", authRoutes);

  // ─── Products Routes ─────────────────────────────────────────────────────────

  // GET /api/products - list all available products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await query("products", (p) => p.is_available !== false);
      // Normalize field names for frontend compatibility
      const normalized = products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice: p.price ?? p.basePrice,
        price: p.price ?? p.basePrice,
        category: p.category,
        roastLevel: p.roast_level ?? p.roastLevel ?? "Medium",
        image: p.image_url ?? p.image,
        image_url: p.image_url ?? p.image,
        available: p.is_available !== false,
        is_available: p.is_available !== false,
        created_at: p.created_at,
      }));
      res.json(normalized);
    } catch (error) {
      console.error("GET /api/products error:", error);
      res.status(500).json({ message: "Failed to load products" });
    }
  });

  // GET /api/products/:id - get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const p = await get("products", (p) => p.id === req.params.id);
      if (!p) return res.status(404).json({ message: "Product not found" });
      res.json({
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice: p.price ?? p.basePrice,
        price: p.price ?? p.basePrice,
        category: p.category,
        roastLevel: p.roast_level ?? p.roastLevel ?? "Medium",
        image: p.image_url ?? p.image,
        image_url: p.image_url ?? p.image,
        available: p.is_available !== false,
        is_available: p.is_available !== false,
        created_at: p.created_at,
      });
    } catch (error) {
      console.error("GET /api/products/:id error:", error);
      res.status(500).json({ message: "Failed to load product" });
    }
  });

  // POST /api/products - create product (admin only)
  app.post("/api/products", async (req, res) => {
    try {
      const { name, description, basePrice, category, roastLevel, image } = req.body;
      if (!name || !basePrice) return res.status(400).json({ message: "Name and price are required" });

      const newProduct = {
        id: `prod-${Date.now()}`,
        name,
        description: description || "",
        price: Number(basePrice),
        category: category || "Espresso",
        roast_level: roastLevel || "Medium",
        image_url: image || "",
        is_available: true,
        created_at: new Date().toISOString(),
      };
      await run("products", "insert", newProduct);
      res.status(201).json({ ...newProduct, basePrice: newProduct.price, image: newProduct.image_url, roastLevel: newProduct.roast_level, available: true });
    } catch (error) {
      console.error("POST /api/products error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // DELETE /api/products/:id - delete product (admin only)
  app.delete("/api/products/:id", async (req, res) => {
    try {
      await run("products", "delete", {}, (p) => p.id === req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("DELETE /api/products/:id error:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // PATCH /api/products/:id - update product
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.basePrice !== undefined) updates.price = Number(req.body.basePrice);
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.roastLevel !== undefined) updates.roast_level = req.body.roastLevel;
      if (req.body.image !== undefined) updates.image_url = req.body.image;
      if (req.body.available !== undefined) updates.is_available = req.body.available;

      await run("products", "update", updates, (p) => p.id === req.params.id);
      const updated = await get("products", (p) => p.id === req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("PATCH /api/products/:id error:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // ─── Pickup Slots Routes ──────────────────────────────────────────────────────

  app.get("/api/pickup-slots", async (_req, res) => {
    try {
      const slots = await query("pickup_slots");
      res.json(slots);
    } catch (error) {
      console.error("GET /api/pickup-slots error:", error);
      res.status(500).json({ message: "Failed to load pickup slots" });
    }
  });

  app.post("/api/pickup-slots", async (req, res) => {
    try {
      const newSlot = {
        id: `slot-${Date.now()}`,
        time: req.body.time || "04:00 PM",
        capacity: Number(req.body.capacity) || 10,
        reserved: 0,
        available: true,
      };
      await run("pickup_slots", "insert", newSlot);
      res.status(201).json(newSlot);
    } catch (error) {
      console.error("POST /api/pickup-slots error:", error);
      res.status(500).json({ message: "Failed to create pickup slot" });
    }
  });

  app.delete("/api/pickup-slots/:id", async (req, res) => {
    try {
      await run("pickup_slots", "delete", {}, (s) => s.id === req.params.id);
      res.json({ message: "Pickup slot deleted" });
    } catch (error) {
      console.error("DELETE /api/pickup-slots/:id error:", error);
      res.status(500).json({ message: "Failed to delete pickup slot" });
    }
  });

  // ─── Orders Routes ────────────────────────────────────────────────────────────

  // GET /api/orders - get all orders (admin) or user's orders
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      let orders;
      if (userId) {
        orders = await query("orders", (o) => o.customer_id === userId);
      } else {
        orders = await query("orders");
      }
      res.json(orders);
    } catch (error) {
      console.error("GET /api/orders error:", error);
      res.status(500).json({ message: "Failed to load orders" });
    }
  });

  // POST /api/orders - place a new order
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerId, items, totalPrice, pickupSlotId, pickupTime } = req.body;

      if (!customerId || !items || !pickupSlotId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const slot = await get("pickup_slots", (s) => s.id === pickupSlotId);
      if (!slot) return res.status(404).json({ message: "Pickup slot not found" });
      if (!slot.available) return res.status(400).json({ message: "Pickup slot not available" });

      const loyaltyPointsAwarded = Math.floor(Number(totalPrice) / 10);

      const newOrder = {
        id: `order-${Date.now()}`,
        customer_id: customerId,
        items: JSON.stringify(items),
        total_price: Number(totalPrice),
        pickup_slot_id: pickupSlotId,
        pickup_time: pickupTime || slot.time,
        status: "Pending",
        loyalty_points_awarded: loyaltyPointsAwarded,
        created_at: new Date().toISOString(),
      };

      await run("orders", "insert", newOrder);

      // Update pickup slot reservation
      const newReserved = slot.reserved + 1;
      await run(
        "pickup_slots",
        "update",
        { reserved: newReserved, available: newReserved < slot.capacity },
        (s) => s.id === pickupSlotId
      );

      // Update user loyalty points
      const user = await get("users", (u) => u.id === customerId);
      if (user) {
        const newPoints = (user.loyalty_points || 0) + loyaltyPointsAwarded;
        const newTotalSpent = (user.total_spent || 0) + Number(totalPrice);
        let tier = "Bronze";
        if (newPoints >= 500) tier = "Gold";
        else if (newPoints >= 200) tier = "Silver";

        await run(
          "users",
          "update",
          { loyalty_points: newPoints, total_spent: newTotalSpent, tier },
          (u) => u.id === customerId
        );
      }

      // Return a normalized order for the frontend
      res.status(201).json({
        ...newOrder,
        items: items, // Return as array
        customerId: newOrder.customer_id,
        totalPrice: newOrder.total_price,
        pickupSlotId: newOrder.pickup_slot_id,
        pickupTime: newOrder.pickup_time,
        loyaltyPointsAwarded: newOrder.loyalty_points_awarded,
        createdAt: newOrder.created_at,
      });
    } catch (error) {
      console.error("POST /api/orders error:", error);
      res.status(500).json({ message: "Failed to place order" });
    }
  });

  // PATCH /api/orders/:id/status - update order status (admin)
  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await run("orders", "update", { status }, (o) => o.id === req.params.id);
      res.json({ message: "Order status updated" });
    } catch (error) {
      console.error("PATCH /api/orders/:id/status error:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // GET /api/users/me - get current user info (to refresh loyalty points etc.)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await get("users", (u) => u.id === req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      console.error("GET /api/users/:id error:", error);
      res.status(500).json({ message: "Failed to load user" });
    }
  });

  // ─── Reviews Routes ───────────────────────────────────────────────────────────

  // GET /api/reviews - list all reviews
  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await query("reviews", () => true);
      reviews.sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
      res.json(reviews);
    } catch (error) {
      console.error("GET /api/reviews error:", error);
      res.status(500).json({ message: "Failed to load reviews" });
    }
  });

  // POST /api/reviews - submit a review
  app.post("/api/reviews", async (req, res) => {
    try {
      const { userId, userName, rating, comment } = req.body;
      if (!userId || !comment || !rating) {
        return res.status(400).json({ message: "userId, rating, and comment are required" });
      }
      const review = {
        id: `rev-${Date.now()}`,
        userId,
        userName: userName || "Anonymous",
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: String(comment).trim(),
        created_at: new Date().toISOString(),
      };
      await run("reviews", "insert", review);
      res.status(201).json(review);
    } catch (error) {
      console.error("POST /api/reviews error:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // DELETE /api/reviews/:id - delete a review (user's own or admin)
  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      await run("reviews", "delete", {}, (r: any) => r.id === req.params.id);
      res.json({ message: "Review deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });


  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 5001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
