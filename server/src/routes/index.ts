import { Router } from "express";
import userRoutes from "./user.routes.ts";
import questionRoutes from "./questions.routes.ts";
import answerRoutes from "./answers.routes.ts";
import scoreRoutes from "./scores.routes.ts";

const router = Router();

router
  .use("/users", userRoutes)
  .use("/questions", questionRoutes)
  .use("/answers", answerRoutes)
  .use("/scores", scoreRoutes);

export default router;