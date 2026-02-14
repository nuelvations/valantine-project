import { Router, type Request, type Response } from "express";
import { ScoreComparatorService } from "@/services/ScoreComparatorService";
import Answer from "@/models/answer.model";
import Question from "@/models/question.model";
import Score from "@/models/score.model";
import userModel from "@/models/user.model";

const router = Router();

const scoreComparator = new ScoreComparatorService();

// Compare answers and generate scores
router.post("/compare/:questionId", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params as { questionId: string };

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
    const { comparisons, overallScore, overallFeedback, totalPoints } = await scoreComparator.compareAnswers(
      question.mood,
      question.choice,
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
      user1Id: answer1?.userId,
      user2Id: answer2?.userId,
      comparisons,
      overallScore,
      overallFeedback,
      totalPoints
    });

    res.status(201).json({
      score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to compare answers",
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

router.post("/claim/:scoreId", async (req: Request, res: Response) => {
  try {
    const { scoreId } = req.params as { scoreId: string };

    const score = await Score.findById(scoreId);
    if (!score) {
      res.status(404).json({ error: "Score not found" });
      return;
    }

    const user1 = await userModel.findById(score.user1Id);
    const user2 = await userModel.findById(score.user2Id);
    if (!user1 || !user2) {
      res.status(400).json({ error: " one of the user id attached is invalid" });
      return;
    }

    // Update score to indicate it's claimed
    score.isClaimed = true;

    user1.totalPoints += score.totalPoints;
    user2.totalPoints += score.totalPoints;

    await score.save();
    await user1.save();
    await user2.save();

    res.status(200).json({
      message: "Score claimed successfully",
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to claim score",
      details: error instanceof Error ? error.message : "",
    });
  }
});

// Get score by question ID
router.get("/:questionId", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params as { questionId: string };

    const score = await Score.findOne({ questionId }).lean();

    if (!score) {
      res.status(404).json({ error: "Score not found" });
      return;
    }

    res.status(200).json({ score });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve score",
      details: error instanceof Error ? error.message : "",
    });
  }
});

export default router;
