import { NextFunction, Request, Response } from "express";
import getUserData from "../utils/getUserByEmail";

const checkIsAdminOrSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await getUserData(req.user.user.email);
  if (!user) {
    return res.status(400).json({ error: "No such user found!" });
  }
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return res.status(400).json({ error: "Access denied!" });
  }
  next();
};

export default checkIsAdminOrSuperAdmin;
