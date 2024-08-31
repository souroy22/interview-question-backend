"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const question_controllers_1 = __importDefault(require("../controllers/question.controllers"));
const checkAdminOrSuperAdmin_1 = __importDefault(require("../middlewares/checkAdminOrSuperAdmin"));
const pagination_1 = require("../utils/pagination");
const questionRouter = express_1.default.Router();
questionRouter.get("/all", verifyToken_1.default, pagination_1.paginateMiddleware, question_controllers_1.default.getAllQuestions);
questionRouter.get("/details/:questionSlug", verifyToken_1.default, question_controllers_1.default.getQuestionById);
questionRouter.post("/create", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, question_controllers_1.default.createQuestion);
questionRouter.patch("/update/:questionSlug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, question_controllers_1.default.updateQuestion);
questionRouter.post("/delete/:questionSlug", verifyToken_1.default, checkAdminOrSuperAdmin_1.default, question_controllers_1.default.deleteQuestion);
exports.default = questionRouter;
//# sourceMappingURL=question.routes.js.map