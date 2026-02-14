import { Router, type Request, type Response } from "express";
import { QuestionGeneratorService } from "@/services/QuestionGeneratorService";
import Question from "@/models/question.model";
import user from "@/models/user.model";

const router = Router();

const questionGenerator = new QuestionGeneratorService();

// Generate mood-based questions
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { userId, mood, context, choice } = req.body;

    if (!mood || !choice || !userId) {
      res.status(400).json({ error: "userId, mood, and choice are required" });
      return;
    }

    const updateUser = await user.findById(userId);
    if (!updateUser) {
      res.status(404).json({ error: "id sent from client is invalid" });
      return;
    }

    const { moodDescription, questions } = await questionGenerator.generateQuestions(mood, choice, context);

    const question = new Question({
      user: userId,
      mood,
      choice,
      moodDescription,
      questions,
    });

    updateUser.questionsCreated += 1;

    await updateUser.save();

    await question.save();

    res.status(201).json({ questionId: question._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate questions",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get questions by user ID (must be before :questionId)
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    const questions = await Question.find({ user: userId }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve questions",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get questions by ID
router.get("/:questionId", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId).lean();

    if (!question) {
      res.status(404).json({ error: "Questions not found" });
      return;
    }

    res.status(200).json({
      questionId: question._id,
      mood: question.mood,
      moodDescription: question.moodDescription,
      questions: question.questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve questions",
      details: error instanceof Error ? error.message : "",
    });
  }
});

export default router;
