export interface User {
  _id: string;
  username: string;
  email: string;
  regComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  _id: string;
  user: string;
  mood: string;
  choice: string;
  moodDescription: string;
  questions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  user: User;
  exists?: boolean;
}

export interface Answer {
  _id: string;
  questionId: string;
  username: string;
  userId: string;
  answers: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreComparison {
  questionIndex: number;
  question: string;
  user1Answer: string;
  user2Answer: string;
  user1user: string;
  user2Name: string;
  compatibility: number;
  explanation: string;
}

export interface Score {
  _id: string;
  questionId: string;
  mood: string;
  comparisons: ScoreComparison[];
  overallScore: number;
  overallFeedback: string;
  user1Id: string;
  user2Id: string;
  isClaimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalPoints: number;
  questionsCreated: number;
  moneyEarned: number;
}
