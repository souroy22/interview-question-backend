"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const topic_routes_1 = __importDefault(require("./topic.routes"));
const question_routes_1 = __importDefault(require("./question.routes"));
const routers = express_1.default.Router();
routers.use("/auth", auth_routes_1.default);
routers.use("/user", user_routes_1.default);
routers.use("/category", category_routes_1.default);
routers.use("/topic", topic_routes_1.default);
routers.use("/question", question_routes_1.default);
exports.default = routers;
//# sourceMappingURL=index.js.map