import { Router, type Request, type Response } from "express";
import { ScoreComparatorService } from "../services/ScoreComparatorService.js";
import Answer from "@/models/answer.model";
import Question from "@/models/question.model";
import Score from "@/models/score.model";

const router = Router();

const scoreComparator = new ScoreComparatorService();

// Compare answers and generate scores
router.post("/compare", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      res.status(400).json({ error: "questionId is required" });
      return;
    }

    // Get the question
    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    // Get answers from both partners
    const answers = await Answer.find({ questionId });

    if (answers.length < 2) {
      res.status(400).json({
        error: "Both partners need to submit answers before comparison",
      });
      return;
    }

    const [answer1, answer2] = answers;

    // Extract just the answer strings
    const user1AnswerStrings = answer1!.answers.map((a) => a.answer);
    const user2AnswerStrings = answer2!.answers.map((a) => a.answer);

    // Compare answers using OpenAI
    const { comparisons, overallScore, overallFeedback } = await scoreComparator.compareAnswers(
      question.mood,
      answer1!.username,
      answer2!.username,
      question.questions,
      user1AnswerStrings,
      user2AnswerStrings
    );

    // Save the score
    const score = await Score.create({
      questionId,
      mood: question.mood,
      comparisons,
      overallScore,
      overallFeedback,
    });

    res.status(201).json({
      scoreId: score._id,
      comparisons,
      overallScore,
      overallFeedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to compare answers",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get score by ID
router.get("/:scoreId", async (req: Request, res: Response) => {
  try {
    const { scoreId } = req.params;

    const score = await Score.findById(scoreId);

    if (!score) {
      res.status(404).json({ error: "Score not found" });
      return;
    }

    res.status(200).json({
      scoreId: score._id,
      mood: score.mood,
      comparisons: score.comparisons,
      overallScore: score.overallScore,
      overallFeedback: score.overallFeedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve score",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get all scores for a couple
router.get("/couple/:coupleId", async (req: Request, res: Response) => {
  try {
    const { coupleId } = req.params;

    const scores = await Score.find({ coupleId }).sort({ createdAt: -1 });

    if (scores.length === 0) {
      res.status(200).json({
        scoresCount: 0,
        scores: [],
      });
      return;
    }

    res.status(200).json({
      scoresCount: scores.length,
      scores: scores.map((s) => ({
        scoreId: s._id,
        mood: s.mood,
        overallScore: s.overallScore,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve scores",
      details: error instanceof Error ? error.message : "",
    });
  }
});

export default router;
