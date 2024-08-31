import express from "express";
import verifyToken from "../middlewares/verifyToken";
import questionControllers from "../controllers/question.controllers";
import checkIsAdminOrSuperAdmin from "../middlewares/checkAdminOrSuperAdmin";
import { paginateMiddleware } from "../utils/pagination";

const questionRouter = express.Router();

questionRouter.get(
  "/all",
  verifyToken,
  paginateMiddleware,
  questionControllers.getAllQuestions
);

questionRouter.get(
  "/details/:questionSlug",
  verifyToken,
  questionControllers.getQuestionById
);

questionRouter.post(
  "/create",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  questionControllers.createQuestion
);

questionRouter.patch(
  "/update/:questionSlug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  questionControllers.updateQuestion
);

questionRouter.post(
  "/delete/:questionSlug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  questionControllers.deleteQuestion
);

export default questionRouter;
