"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const topicSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: mongoose_1.Types.ObjectId, required: true, ref: "User" },
    verified: { type: Boolean, default: false },
    category: { type: mongoose_1.Types.ObjectId, required: true, ref: "Category" },
});
const Topic = (0, mongoose_1.model)("Topic", topicSchema);
exports.default = Topic;
//# sourceMappingURL=Topic.model.js.map