"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdminValidationMiddleware = void 0;
const joi_1 = __importDefault(require("joi"));
const utility_1 = require("../utility");
const loginAdminSchema = joi_1.default.object({
    username: joi_1.default.string().required().min(1).messages({
        "string.empty": "Username is not allowed to be empty",
        "any.required": "Username is required",
    }),
    password: joi_1.default.string().required().min(1).messages({
        "string.empty": "Password is not allowed to be empty",
        "any.required": "Password is required",
    }),
});
const loginAdminValidationMiddleware = function validateAdminLogin(req, res, next) {
    const { error } = loginAdminSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return (0, utility_1.sendErrorResponse)(res, error.details.map((detail) => detail.message).join(", "));
    }
    next();
};
exports.loginAdminValidationMiddleware = loginAdminValidationMiddleware;
