import express from "express";
import bcrypt from "bcryptjs";
import { get, run } from "./db.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await get("users", (u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Omit password from response
    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await get("users", (u) => u.email === email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: "customer",
      loyalty_points: 0,
      total_spent: 0,
      tier: "Bronze",
      created_at: new Date().toISOString()
    };

    await run("users", "insert", newUser);

    const { password: _, ...userInfo } = newUser;
    res.status(201).json(userInfo);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
