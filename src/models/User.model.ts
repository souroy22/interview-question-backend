import { Document, model, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: number;
  email: string;
  password: string;
  avatar: string | null;
  role: string;
  adminMode: boolean;
}

const UserSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  role: {
    type: String,
    required: true,
    enum: ["USER", "ADMIN", "SUPER_ADMIN"],
    default: "USER",
  },
  adminMode: { type: Boolean, default: true },
});

// hash password before save
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = model<IUser>("User", UserSchema);
export default User;
