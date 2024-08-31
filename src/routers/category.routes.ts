import express from "express";
import verifyToken from "../middlewares/verifyToken";
import checkIsAdminOrSuperAdmin from "../middlewares/checkAdminOrSuperAdmin";
import categoryControllers from "../controllers/category.controllers";
import checkMissingFields from "../middlewares/checkMissingFields";
import { paginateMiddleware } from "../utils/pagination";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  checkMissingFields("CREATE_CATEGORY"),
  categoryControllers.createCategory
);

categoryRouter.patch(
  "/update/:slug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  categoryControllers.updateCategory
);

categoryRouter.delete(
  "/delete/:slug",
  verifyToken,
  checkIsAdminOrSuperAdmin,
  categoryControllers.deleteCategory
);

categoryRouter.get(
  "/all",
  verifyToken,
  paginateMiddleware,
  categoryControllers.getCategories
);

export default categoryRouter;
