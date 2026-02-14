import { Router, type Request, type Response } from "express";
import { ScoreComparatorService } from "@/services/ScoreComparatorService";
import Answer from "@/models/answer.model";
import Question from "@/models/question.model";
import Score from "@/models/score.model";
import userModel from "@/models/user.model";
import { claimTangle } from "@/utils/account";
import type { Address } from "viem";

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

    const { recipientAddress, userId } = req.query;

    const score = await Score.findById(scoreId);
    if (!score) {
      res.status(404).json({ error: "Score not found" });
      return;
    }

    // Check if user has already claimed this score
    const hasUserClaimed = score.user1Id === userId ? score.user1Claimed : score.user2Id === userId ? score.user2Claimed : null;
    if (hasUserClaimed === null) {
      res.status(400).json({ error: "Invalid user ID for this score" });
      return;
    }
    if (hasUserClaimed) {
      res.status(400).json({ error: "You have already claimed this score" });
      return;
    }

    if (score.overallScore < 80) {
      res.status(400).json({ error: "Score is below the minimum threshold of 80%" });
      return;
    }

    const claimUser = await userModel.findById(userId);
    if (!claimUser) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    // Claim points using Tangle
    await claimTangle(recipientAddress as unknown as Address);

    // Mark the claiming user's status
    if (score.user1Id === userId) {
      score.user1Claimed = true;
    } else if (score.user2Id === userId) {
      score.user2Claimed = true;
    }

    claimUser.totalPoints += score.totalPoints;
    claimUser.moneyEarned += 100;

    await score.save();
    await claimUser.save();

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

    const scoreWithClaimed = {
      ...score,
      isClaimed: score ? (score.user1Claimed && score.user2Claimed) : false,
    }

    res.status(200).json({ score: scoreWithClaimed });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to retrieve score",
      details: error instanceof Error ? error.message : "",
    });
  }
});

export default router;
