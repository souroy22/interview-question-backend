import express from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import categoryRouter from "./category.routes";
import topicRouter from "./topic.routes";
import questionRouter from "./question.routes";

const routers = express.Router();

routers.use("/auth", authRouter);
routers.use("/user", userRouter);
routers.use("/category", categoryRouter);
routers.use("/topic", topicRouter);
routers.use("/question", questionRouter);

export default routers;
