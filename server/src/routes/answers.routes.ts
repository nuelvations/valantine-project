import { Router, type Request, type Response } from "express";
import Answer from "@/models/answer.model";
import Question from "@/models/question.model";

const router = Router();

// Submit answers to questions
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const { questionId, userId, username, answers } = req.body;

    if (!questionId || !userId || !username || !answers) {
      res.status(400).json({
        error:
          "questionId, userId, username, and answers are required",
      });
      return;
    }

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    await Answer.create({
      questionId,
      username,
      answers
    });

    res.status(201).json({ message: "Answers submitted successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to submit answers",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get all answers for a question
router.get("/by-question/:questionId", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params as { questionId: string };

    const answers = await Answer.find({ questionId });

    if (answers.length === 0) {
      res.status(404).json({ error: "No answers found for this question" });
      return;
    };

    res.status(200).json({
      answersCount: answers.length,
      answers: answers.map((a) => ({
        answerId: a._id,
        username: a.username,
        answers: a.answers,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve answers",
      details: error instanceof Error ? error.message : "",
    });
  }
});

export default router;
