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
const categoryControllers = {
    createCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name } = req.body;
            const verified = req.user.user.role === "SUPER_ADMIN";
            let slug = (0, slugify_1.default)(name, { lower: true });
            const isExist = yield Category_model_1.default.findOne({ slug });
            if (isExist) {
                const uid = new short_unique_id_1.default({ length: 6 });
                slug += uid.rnd();
            }
            const newCategory = new Category_model_1.default({
                name,
                verified,
                slug,
                createdBy: req.user.user.id,
            });
            yield newCategory.save();
            return res.status(200).json({
                name: newCategory.name,
                slug: newCategory.slug,
                verified: newCategory.verified,
                canModify: true,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    getCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { searchValue, isVerified } = req.query;
            const query = {};
            const trimmedSearchValue = searchValue === null || searchValue === void 0 ? void 0 : searchValue.toString().trim();
            if (trimmedSearchValue) {
                query["name"] = { $regex: trimmedSearchValue, $options: "i" };
            }
            if (isVerified !== undefined) {
                query["verified"] = isVerified;
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const reqQuery = Category_model_1.default.find(query, {
                name: 1,
                slug: 1,
                createdBy: 1,
                verified: 1,
                _id: 0,
            });
            let categories = yield (0, pagination_1.paginate)(reqQuery, req.pagination);
            const modifiedCategories = categories.data.map((category) => {
                var _a, _b;
                // Extract category data from `_doc` to avoid Mongoose metadata
                const categoryData = category._doc || category;
                // Ensure that user and user.id are properly defined
                const canModify = user.role === "SUPER_ADMIN" ||
                    categoryData.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id); // Convert ObjectId to string for comparison
                return Object.assign(Object.assign({}, categoryData), { canModify });
            });
            return res.status(200).json(Object.assign(Object.assign({}, categories), { data: modifiedCategories }));
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    updateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { name, verified } = req.body;
            const { slug } = req.params;
            const updateFields = {};
            if (name) {
                updateFields["name"] = name.toString();
            }
            if (verified !== undefined) {
                updateFields["verified"] = Boolean(verified);
            }
            const isExist = yield Category_model_1.default.findOne({ slug });
            if (!isExist) {
                return res.status(404).json({ error: "No category found!" });
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canModify = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canModify) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const updatedCategory = yield Category_model_1.default.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true, runValidators: true });
            if (!updatedCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            return res.status(200).json({
                name: updatedCategory.name,
                slug: updatedCategory.slug,
                verified: updatedCategory.verified,
                canModify: canModify,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    deleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { slug } = req.params;
            const isExist = yield Category_model_1.default.findOne({ slug });
            if (!isExist) {
                return res.status(404).json({ error: "No category found!" });
            }
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            const canDelete = user.role === "SUPER_ADMIN" ||
                isExist.createdBy.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id);
            if (!canDelete) {
                return res.status(403).json({ error: "Access Denied" });
            }
            const deletedCategory = yield Category_model_1.default.findOneAndDelete({ slug });
            if (!deletedCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            return res.status(200).json({
                msg: "Category deleted successfully",
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
exports.default = categoryControllers;
//# sourceMappingURL=category.controllers.js.map