import { Router, type Request, type Response } from "express";
import user from "@/models/user.model";

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

      const existingUser = await user.findOne({ $or: [{ email }, { username }] });

      if (existingUser) {
        res.status(400).json({
          error: "user is already registered or username exists",
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
  }).get("/check-user", async (req: Request, res: Response) => {
    try {
      const { email } = req.query as { email: string };

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
  })
  .get("/:userId/stats", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const userFound = await user.findById(userId);

      if (!userFound) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        totalPoints: userFound.totalPoints,
        questionsCreated: userFound.questionsCreated,
        moneyEarned: userFound.moneyEarned,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });

export default router;
