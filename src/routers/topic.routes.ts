import express from "express";
import verifyToken from "../middlewares/verifyToken";
import checkIsAdminOrSuperAdmin from "../middlewares/checkAdminOrSuperAdmin";
import checkMissingFields from "../middlewares/checkMissingFields";
import { paginateMiddleware } from "../utils/pagination";
import topicControllers from "../controllers/topic.controllers";

const topicRouter = express.Router();

topicRouter.post(
  "/create",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  checkMissingFields("CREATE_CATEGORY"),
  topicControllers.createTopic
);

topicRouter.patch(
  "/update/:slug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  topicControllers.updateTopic
);

topicRouter.delete(
  "/delete/:slug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  topicControllers.deleteTopic
);

topicRouter.get(
  "/all",
  verifyToken,
  paginateMiddleware,
  topicControllers.getTopics
);

export default topicRouter;
