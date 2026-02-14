import { Router, type Request, type Response } from "express";
import user from "@/models/user.model";
import cryptoRandomString from "crypto-random-string";

const router = Router();

// Create a new User
router
  .post("/register", async (req: Request, res: Response) => {
    try {
      const { username, email } = req.body;

      if (!username || !email) {
        res.status(400).json({
          error:
            "user must have username and email fields",
        });
        return;
      }

      const existingUser = await user.findOne({ email });

      if (existingUser) {
        res.status(400).json({
          error: "user are already registered",
        });
        return;
      }

      const newUser = await user.create({ email, username });

      res.status(201).json({
        message: "User registered successfully",
        user: newUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to register user" });
    }
  })
  .get("/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const userFound = await user.findById(userId);

      if (!userFound) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        user1: userFound || null,
        totalQuestions: "",
        compatibilityScore: "",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  }).get("/check-user", async (req: Request, res: Response) => {
    try {
      const { email } = req.query;

      if (!email) {
        res.status(400).json({ error: "email query parameter is required" });
        return;
      }

      const userFound = await user.findOne({ email });

      res.status(200).json({
        exists: !!userFound,
        user: userFound || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to check user" });
    }
  });

export default router;
