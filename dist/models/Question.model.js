"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    solution: { type: String, required: true },
    youtubeLink: { type: String, default: null },
    websiteLink: { type: String, default: null },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: mongoose_1.Types.ObjectId, required: true, ref: "User" },
    verified: { type: Boolean, default: false },
    type: { type: String, required: true, enum: ["THEORY", "CODING"] },
    topic: { type: mongoose_1.Types.ObjectId, required: true, ref: "Topic" },
    language: {
        type: String,
        required: true,
        enum: ["javascript", "typescript", "jsx", "tsx"],
    },
});
const Question = (0, mongoose_1.model)("Question", questionSchema);
exports.default = Question;
//# sourceMappingURL=Question.model.js.map