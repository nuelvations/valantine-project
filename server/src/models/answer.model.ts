import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  questionId: string;
  userId: string;
  username: string;
  answers: {
    question: string;
    answer: string 
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  answers: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
  }],
}, { timestamps: true });

export default mongoose.model<IAnswer>("Answer", AnswerSchema);
