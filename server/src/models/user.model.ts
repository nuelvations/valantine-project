import mongoose, { Schema, Document } from "mongoose";


export interface IUser extends Document {
  username: string;
  email: string;
  regComplete: boolean;
  totalPoints: number;
  questionsCreated: number;
  moneyEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const User: Schema = new Schema({
  username: {
    type: String,
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  questionsCreated: {
    type: Number,
    default: 0
  },
  moneyEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model<IUser>("User", User);
  