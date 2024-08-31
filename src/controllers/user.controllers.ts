import { Request, Response } from "express";
import getUserData from "../utils/getUserByEmail";
import User from "../models/User.model";

const userControllers = {
  getUser: async (req: Request, res: Response) => {
    try {
      const user = await getUserData(req.user.user.email);
      if (!user) {
        return res.status(404).json({ error: "No Such user found" });
      }
      const { firstName, lastName, role, email, phone, avatar, adminMode } =
        user;
      const userData: any = { firstName, lastName, role, email, phone, avatar };
      if (userData.role !== "USER") {
        userData["adminMode"] = adminMode;
      }
      return res.status(200).json({ user: userData });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
  updateUser: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, phone, avatar, adminMode } = req.body;
      const user = await getUserData(req.user.user.email);
      if (user.role === "USER" && adminMode !== undefined) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (phone && user.phone !== phone) {
        const isExist = await User.findOne({ phone });
        if (isExist) {
          return res.status(400).json({
            error: "Phone Number already register. Use another number.",
          });
        }
      }
      const updatedData = await User.findByIdAndUpdate(
        user._id,
        { $set: { firstName, lastName, phone, avatar, adminMode } },
        { new: true, runValidators: true }
      );
      const userData: any = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phone: updatedData.phone,
        avatar: updatedData.avatar,
        role: updatedData.role,
        email: updatedData.email,
      };
      if (userData.role !== "USER") {
        userData["adminMode"] = adminMode;
      }
      return res.status(200).json({ user: userData });
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ error: "Something went wrong!" });
      }
    }
  },
};

export default userControllers;
