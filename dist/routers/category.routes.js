"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const checkAdminOrSuperAdmin_1 = __importDefault(require("../middlewares/checkAdminOrSuperAdmin"));
const category_controllers_1 = __importDefault(require("../controllers/category.controllers"));
const checkMissingFields_1 = __importDefault(require("../middlewares/checkMissingFields"));
const pagination_1 = require("../utils/pagination");
const categoryRouter = express_1.default.Router();
categoryRouter.post("/create", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, (0, checkMissingFields_1.default)("CREATE_CATEGORY"), category_controllers_1.default.createCategory);
categoryRouter.patch("/update/:slug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, category_controllers_1.default.updateCategory);
categoryRouter.delete("/delete/:slug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, category_controllers_1.default.deleteCategory);
categoryRouter.get("/all", verifyToken_1.default, pagination_1.paginateMiddleware, category_controllers_1.default.getCategories);
exports.default = categoryRouter;
//# sourceMappingURL=category.routes.js.map