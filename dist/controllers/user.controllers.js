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
const User_model_1 = __importDefault(require("../models/User.model"));
const userControllers = {
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            if (!user) {
                return res.status(404).json({ error: "No Such user found" });
            }
            const { firstName, lastName, role, email, phone, avatar, adminMode } = user;
            const userData = { firstName, lastName, role, email, phone, avatar };
            if (userData.role !== "USER") {
                userData["adminMode"] = adminMode;
            }
            return res.status(200).json({ user: userData });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
    updateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { firstName, lastName, phone, avatar, adminMode } = req.body;
            const user = yield (0, getUserByEmail_1.default)(req.user.user.email);
            if (user.role === "USER" && adminMode !== undefined) {
                return res.status(403).json({ error: "Access denied" });
            }
            if (phone && user.phone !== phone) {
                const isExist = yield User_model_1.default.findOne({ phone });
                if (isExist) {
                    return res.status(400).json({
                        error: "Phone Number already register. Use another number.",
                    });
                }
            }
            const updatedData = yield User_model_1.default.findByIdAndUpdate(user._id, { $set: { firstName, lastName, phone, avatar, adminMode } }, { new: true, runValidators: true });
            const userData = {
                firstName: updatedData.firstName,
                lastName: updatedData.lastName,
                phone: updatedData.phone,
                avatar: updatedData.avatar,
                role: updatedData.role,
                email: updatedData.email,
            };
            if (userData.role !== "USER") {
                userData["adminMode"] = adminMode;
            }
            return res.status(200).json({ user: userData });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(`Error: ${error.message}`);
                return res.status(500).json({ error: "Something went wrong!" });
            }
        }
    }),
};
exports.default = userControllers;
//# sourceMappingURL=user.controllers.js.map