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
const Category_model_1 = __importDefault(require("../models/Category.model"));
const pagination_1 = require("../utils/pagination");
const slugify_1 = __importDefault(require("slugify"));
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const getUserByEmail_1 = __importDefault(require("../utils/getUserByEmail"));
const Topic_model_1 = __importDefault(require("../models/Topic.model"));
const topicControllers = {
    createTopic: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, categorySlug } = req.body;
            const verified = req.user.user.role === "SUPER_ADMIN";
            let slug = (0, slugify_1.default)(name, { lower: true });
            const isExist = yield Topic_model_1.default.findOne({ slug });
            if (isExist) {
                const uid = new short_unique_id_1.default({ length: 6 });
                slug += uid.rnd();
            }
            const category = yield Category_model_1.default.findOne({ slug: categorySlug });
            if (!category) {
                return res.status(404).json({ error: "No category found!" });
            }
            const newTopic = new Topic_model_1.default({
                name,
                verified,
                slug,
                createdBy: req.user.user.id,
                category: category._id,
            });
            yield newTopic.save();
            return res.status(200).json({
                name: newTopic.name,
                slug: newTopic.slug,
                verified: newTopic.verified,
                canModify: true,
                category: { name: category.name, slug: category.slug },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    getTopics: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { searchValue, isVerified, categorySlug } = req.query;
            const query = {};
            if (categorySlug) {
                const category = yield Category_model_1.default.findOne({ slug: categorySlug });
                if (!category) {
                    return res.status(404).json({ error: "No category found!" });
                }
                query["category"] = category._id;
            }
            const trimmedSearchValue = searchValue === null || searchValue === void 0 ? void 0 : searchValue.toString().trim();
            if (trimmedSearchValue) {
                query["name"] = { $regex: trimmedSearchValue, $options: "i" };
            }
            if (isVerified !== undefined) {
                query["verified"] = isVerified;
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const reqQuery = Topic_model_1.default.find(query, {
                name: 1,
                slug: 1,
                createdBy: 1,
                verified: 1,
                category: 1,
                _id: 0,
            }).populate({ path: "category", select: "name slug -_id" });
            let topics = yield (0, pagination_1.paginate)(reqQuery, req.pagination);
            const modifiedTopics = topics.data.map((topic) => {
                var _a, _b;
                // Extract category data from `_doc` to avoid Mongoose metadata
                const topicData = topic._doc || topic;
                // Ensure that user and user.id are properly defined
                const canModify = user.role === "SUPER_ADMIN" ||
                    topicData.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
                return Object.assign(Object.assign({}, topicData), { 
                    // category: { name: category.name, slug: category.slug },
                    canModify });
            });
            return res.status(200).json(Object.assign(Object.assign({}, topics), { data: modifiedTopics }));
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    updateTopic: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { name, verified, categorySlug } = req.body;
            const { slug } = req.params;
            const updateFields = {};
            if (name) {
                console.log("name", name);
                updateFields["name"] = name.toString();
            }
            if (verified !== undefined) {
                updateFields["verified"] = Boolean(verified);
            }
            const isExist = yield Topic_model_1.default.findOne({ slug });
            if (!isExist) {
                return res.status(404).json({ error: "No category found!" });
            }
            const category = yield Category_model_1.default.findOne({ slug: categorySlug });
            if (categorySlug) {
                if (!category) {
                    return res.status(404).json({ error: "No category found!" });
                }
                updateFields["category"] = category._id;
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canModify = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canModify) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const updatedTopic = yield Topic_model_1.default.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true, runValidators: true });
            if (!updatedTopic) {
                return res.status(404).json({ error: "Topic not found" });
            }
            return res.status(200).json({
                name: updatedTopic.name,
                slug: updatedTopic.slug,
                verified: updatedTopic.verified,
                canModify: canModify,
                category: { name: category.name, slug: category.slug },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    deleteTopic: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { slug } = req.params;
            const isExist = yield Topic_model_1.default.findOne({ slug });
            if (!isExist) {
                return res.status(404).json({ error: "No category found!" });
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canDelete = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canDelete) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const deletedTopic = yield Topic_model_1.default.findOneAndDelete({ slug });
            if (!deletedTopic) {
                return res.status(404).json({ error: "Topic not found" });
            }
            return res.status(200).json({
                msg: "Topic deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
};
exports.default = topicControllers;
//# sourceMappingURL=topic.controllers.js.map