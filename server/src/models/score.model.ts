import mongoose, { Schema, Document } from "mongoose";

export interface IScoreComparison {
  questionIndex: number;
  question: string;
  user1Answer: string;
  user2Answer: string;
  user1Name: string;
  user2Name: string;
  compatibility: number;
  explanation: string;
}

export interface IScore extends Document {
  questionId: string;
  mood: string;
  user1Id: string;
  user2Id: string;
  user1Claimed: boolean;
  user2Claimed: boolean;
  totalPoints: number;
  comparisons: IScoreComparison[];
  overallScore: number;
  overallFeedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema: Schema = new Schema({
  questionId: { 
    type: String,
    required: true 
  },
  user1Id: {
    type: String,
    required: true
  },
  user2Id: {
    type: String,
    required: true
  },
  mood: { 
    type: String,
    required: true 
  },
  user1Claimed: {
    type: Boolean,
    default: false
  },
  user2Claimed: {
    type: Boolean,
    default: false
  },
  comparisons: [{
    questionIndex: { 
      type: Number,
      required: true 
    },
    question: { 
      type: String,
      required: true 
    },
    user1Answer: { 
      type: String,
      required: true 
    },
    user2Answer: {
      type: String,
      required: true 
    },
    user1Name: {
      type: String,
      required: true
    },
    user2Name: {
      type: String,
      required: true
    },
    compatibility: { 
      type: Number,
      required: true 
    },
    explanation: { 
      type: String,
      required: true 
    },
  }],
  overallScore: { 
    type: Number,
    required: true 
  },
  totalPoints: {
    type: Number,
    required: true
  },
  overallFeedback: { 
    type: String,
    required: true 
  }
}, { timestamps: true });

export default mongoose.model<IScore>("Score", ScoreSchema);
