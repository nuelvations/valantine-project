import mongoose, { Schema, Document } from "mongoose";

export interface IScoreComparison {
  questionIndex: number;
  question: string;
  user1Answer: string;
  user2Answer: string;
  compatibility: number;
  explanation: string;
}

export interface IScore extends Document {
  questionId: string;
  mood: string;
  user1Id: string;
  user2Id: string;
  isClaimed: boolean;
  comparisons: IScoreComparison[];
  overallScore: number;
  overallFeedback: string;
  claimed: boolean;
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
  isClaimed: {
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
  overallFeedback: { 
    type: String,
    required: true 
  },
  claimed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model<IScore>("Score", ScoreSchema);
