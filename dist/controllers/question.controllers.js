"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserByEmail_1 = __importDefault(require("../utils/getUserByEmail"));
const Question_model_1 = __importDefault(require("../models/Question.model"));
const Topic_model_1 = __importDefault(require("../models/Topic.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const slugify_1 = __importDefault(require("slugify"));
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const pagination_1 = require("../utils/pagination");
const questionControllers = {
    getAllQuestions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { categorySlug, topicSlug, searchValue, verified } = req.query;
            let filter = {};
            if (categorySlug) {
                const category = yield Category_model_1.default.findOne({
                    slug: categorySlug,
                });
                if (!category) {
                    return res.status(404).json({ message: "Category not found" });
                }
                const topics = yield Topic_model_1.default.find({ category: category._id });
                filter.topic = { $in: topics.map((topic) => topic._id) };
            }
            if (topicSlug) {
                const topic = yield Topic_model_1.default.findOne({ slug: topicSlug });
                if (!topic) {
                    return res.status(404).json({ message: "Topic not found" });
                }
                filter.topic = topic._id;
            }
            if (searchValue) {
                filter.$or = [
                    { title: { $regex: searchValue, $options: "i" } },
                    { description: { $regex: searchValue, $options: "i" } },
                ];
            }
            if (verified !== undefined) {
                filter.verified = verified === "true";
            }
            const reqQuery = Question_model_1.default.find(filter).select({
                title: 1,
                description: 1,
                _id: 0,
                verified: 1,
                youtubeLink: 1,
                websiteLink: 1,
                type: 1,
                slug: 1,
            });
            const questions = yield (0, pagination_1.paginate)(reqQuery, req.pagination);
            return res.status(200).json(questions);
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    getQuestionById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { questionSlug } = req.params;
            const question = yield Question_model_1.default.findOne({ slug: questionSlug })
                .select({
                title: 1,
                description: 1,
                _id: 0,
                verified: 1,
                youtubeLink: 1,
                websiteLink: 1,
                solution: 1,
                slug: 1,
                createdBy: 1,
                type: 1,
                topic: 1,
            })
                .populate([
                { path: "createdBy", select: "name _id email" },
                {
                    path: "topic",
                    select: "title slug createdBy verified category",
                    populate: [
                        { path: "category", select: "name slug -_id" },
                        { path: "createdBy", select: "name _id email" },
                    ],
                },
            ]);
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canModify = user.role === "SUPER_ADMIN" ||
                question.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            const questionObject = question.toObject();
            questionObject.canModify = canModify;
            return res.status(200).json({ question: questionObject });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    createQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { title, description, topicSlug, type, solution, youtubeLink, websiteLink, } = req.body;
            const topic = yield Topic_model_1.default.findOne({ slug: topicSlug });
            if (!topic) {
                return res.status(404).json({ error: "No such topic found!" });
            }
            if (type.toString() !== "THEORY" && type.toString() !== "CODING") {
                return res.status(400).json({ error: "Wrong question type!" });
            }
            let slug = (0, slugify_1.default)(title.toString().slice(0, 20).trim(), { lower: true });
            const isExist = yield Question_model_1.default.findOne({ slug });
            if (isExist) {
                const uid = new short_unique_id_1.default({ length: 6 });
                slug += uid.rnd();
            }
            const verified = req.user.user.role === "SUPER_ADMIN";
            const question = new Question_model_1.default({
                title,
                description,
                slug,
                createdBy: req.user.user.id,
                topic: topic._id,
                type,
                solution,
                youtubeLink,
                websiteLink,
                verified,
            });
            yield question.save();
            return res.status(200).json(question);
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    updateQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { title, description, topicSlug, type, solution, youtubeLink, websiteLink, verified, } = req.body;
            const { questionSlug } = req.params;
            const isExist = yield Question_model_1.default.findOne({ slug: questionSlug });
            if (!isExist) {
                return res.status(404).json({ error: "No question found!" });
            }
            const topic = yield Topic_model_1.default.findOne({ slug: topicSlug });
            if (!topic) {
                return res.status(404).json({ error: "No such topic found!" });
            }
            if (type.toString() !== "THEORY" && type.toString() !== "CODING") {
                return res.status(400).json({ error: "Wrong question type!" });
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canModify = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canModify) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const updatedQuestion = yield Question_model_1.default.findOneAndUpdate({ slug: questionSlug }, {
                title,
                description,
                createdBy: req.user.user.id,
                topic: topic._id,
                type,
                solution,
                youtubeLink,
                websiteLink,
                verified,
            }, {
                new: true,
                runValidators: true,
            });
            if (!updatedQuestion) {
                return res.status(404).json({ message: "Question not found" });
            }
            return res.status(200).json({ question: updatedQuestion });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    deleteQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { questionSlug } = req.params;
            const isExist = yield Question_model_1.default.findOne({ slug: questionSlug });
            if (!isExist) {
                return res.status(404).json({ error: "No question found!" });
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canModify = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canModify) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const deletedQuestion = yield Question_model_1.default.findOneAndDelete({
                slug: questionSlug,
            });
            if (!deletedQuestion) {
                return res.status(404).json({ message: "Question not found" });
            }
            return res.status(200).json({ message: "Question deleted successfully" });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
};
exports.default = questionControllers;
//# sourceMappingURL=question.controllers.js.map