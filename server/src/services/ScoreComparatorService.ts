import getClient from ".";
import type { IScoreComparison } from "@/models/score.model";

const client = getClient();

interface ComparisonResult {
  comparisons: IScoreComparison[];
  overallScore: number;
  overallFeedback: string;
}

export class ScoreComparatorService {
  async compareAnswers(
    mood: string,
    user1Name: string,
    user2Name: string,
    questions: string[],
    user1Answers: string[],
    user2Answers: string[]
  ): Promise<ComparisonResult> {
    const answerPairs = questions
      .map((q, i) => `Q${i + 1}: "${q}"\n${user1Name}: "${user1Answers[i]}"\n${user2Name}: "${user2Answers[i]}"`)
      .join("\n\n");

    const prompt = `
      Compare the following question-answer pairs from ${user1Name} and ${user2Name}:

      ${answerPairs}

      For each question, analyze:
      1. How well their answers complement each other
      2. The level of compatibility and understanding shown
      3. Whether they truly know each other
      4. How their answers reflect the "${mood}" mood
      

      Provide a detailed analysis in the following JSON format:
      {
        "comparisons": [
          {
            "questionIndex": 0,
            "question": "the question text",
            "user1Answer": "user1's answer",
            "user2Answer": "user2's answer",
            "compatibility": 85,
            "explanation": "why these answers are/aren't compatible, insights"
          }
        ],
        "overallScore": 82,
        "overallFeedback": "A comprehensive summary of their compatibility, what they do well together, and areas to strengthen their connection"
      }

      Compatibility scores should be 0-100.
    `;

    const message = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: "You are a relationship coach creating personalized questions for couples based on their mood.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message?.choices[0]?.message?.content || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse comparison response");
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      comparisons: result.comparisons,
      overallScore: result.overallScore,
      overallFeedback: result.overallFeedback,
    };
  }
}
