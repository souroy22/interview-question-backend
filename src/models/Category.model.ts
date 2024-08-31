import { Document, model, ObjectId, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  verified: boolean;
  createdBy: ObjectId;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  createdBy: { type: Types.ObjectId, required: true, ref: "User" },
  verified: { type: Boolean, default: false },
});

const Category = model<ICategory>("Category", CategorySchema);
export default Category;
