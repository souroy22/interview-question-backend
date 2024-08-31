import { Document, model, ObjectId, Schema, Types } from "mongoose";

export interface ITopic extends Document {
  name: string;
  slug: string;
  verified: boolean;
  createdBy: ObjectId;
  category: ObjectId;
}

const topicSchema: Schema<ITopic> = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  createdBy: { type: Types.ObjectId, required: true, ref: "User" },
  verified: { type: Boolean, default: false },
  category: { type: Types.ObjectId, required: true, ref: "Category" },
});

const Topic = model<ITopic>("Topic", topicSchema);
export default Topic;
