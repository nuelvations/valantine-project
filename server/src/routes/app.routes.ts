import { Router } from "express";
import userRoutes from "./user.routes";
import questionRoutes from "./questions.routes";
import answerRoutes from "./answers.routes";
import scoreRoutes from "./scores.routes";

const router = Router();

router
  .use("/users", userRoutes)
  .use("/questions", questionRoutes)
  .use("/answers", answerRoutes)
  .use("/scores", scoreRoutes);

export default router;