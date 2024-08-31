"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const checkAdminOrSuperAdmin_1 = __importDefault(require("../middlewares/checkAdminOrSuperAdmin"));
const checkMissingFields_1 = __importDefault(require("../middlewares/checkMissingFields"));
const pagination_1 = require("../utils/pagination");
const topic_controllers_1 = __importDefault(require("../controllers/topic.controllers"));
const topicRouter = express_1.default.Router();
topicRouter.post("/create", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, (0, checkMissingFields_1.default)("CREATE_CATEGORY"), topic_controllers_1.default.createTopic);
topicRouter.patch("/update/:slug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, topic_controllers_1.default.updateTopic);
topicRouter.delete("/delete/:slug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, topic_controllers_1.default.deleteTopic);
topicRouter.get("/all/:categorySlug", verifyToken_1.default, pagination_1.paginateMiddleware, topic_controllers_1.default.getTopics);
exports.default = topicRouter;
//# sourceMappingURL=topic.routes.js.map