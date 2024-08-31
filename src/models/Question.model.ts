import { Document, model, ObjectId, Schema, Types } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  slug: string;
  verified: boolean;
  createdBy: ObjectId;
  topic: ObjectId;
  type: string;
  solution: string;
  youtubeLink: string | null;
  websiteLink: string | null;
}

const questionSchema: Schema<IQuestion> = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  solution: { type: String, required: true },
  youtubeLink: { type: String, default: null },
  websiteLink: { type: String, default: null },
  slug: { type: String, required: true, unique: true },
  createdBy: { type: Types.ObjectId, required: true, ref: "User" },
  verified: { type: Boolean, default: false },
  type: { type: String, required: true, enum: ["THEORY", "CODING"] },
  topic: { type: Types.ObjectId, required: true, ref: "Topic" },
});

const Question = model<IQuestion>("Question", questionSchema);
export default Question;
