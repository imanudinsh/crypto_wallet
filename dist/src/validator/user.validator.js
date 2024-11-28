"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidationMiddleware = void 0;
const joi_1 = __importDefault(require("joi"));
const utility_1 = require("../utility");
const createUserSchema = joi_1.default.object({
    address: joi_1.default.string().required().min(1).messages({
        "string.empty": "Address is not allowed to be empty",
        "any.required": "Address is required",
    }),
    message: joi_1.default.string().required().min(1).messages({
        "string.empty": "Message is not allowed to be empty",
        "any.required": "Message is required",
    }),
    hash: joi_1.default.string().required().min(1).messages({
        "string.empty": "Hash is not allowed to be empty",
        "any.required": "hash is required",
    }),
});
const createUserValidationMiddleware = function validateCreateUser(req, res, next) {
    const { error } = createUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return (0, utility_1.sendErrorResponse)(res, error.details.map((detail) => detail.message).join(", "));
    }
    next();
};
exports.createUserValidationMiddleware = createUserValidationMiddleware;
