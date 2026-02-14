import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  user: string;
  mood: string;
  choice: string;
  moodDescription: string;
  questions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  choice: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true 
  },
  moodDescription: {
    type: String,
    required: true 
  },
  questions: [{
    type: String,
    required: true
  }],
}, { timestamps: true });

export default mongoose.model<IQuestion>("Question", QuestionSchema);
