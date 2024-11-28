"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = exports.getStaticPath = exports.handlePrismaError = exports.errorHandler = exports.sendErrorResponse = exports.sendSuccessResponse = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname +
            "-" +
            Date.now() +
            `.${file.originalname.split(".")[file.originalname.split(".").length - 1]}`);
    },
});
exports.upload = (0, multer_1.default)({ storage });
function sendSuccessResponse(res, data, statusCode = 200) {
    const response = {
        status: "success",
        data,
    };
    return res.status(statusCode).json(response);
}
exports.sendSuccessResponse = sendSuccessResponse;
function sendErrorResponse(res, message, statusCode = 400) {
    const response = {
        status: "error",
        message,
    };
    return res.status(statusCode).json(response);
}
exports.sendErrorResponse = sendErrorResponse;
function errorHandler(err, req, res, next) {
    console.error(err); // Log the error for debugging purposes
    sendErrorResponse(res, "An unexpected error occurred", 500);
}
exports.errorHandler = errorHandler;
function handlePrismaError(error) {
    var _a;
    switch (error.code) {
        case "P2002":
            return "Unique constraint failed on the fields: " + ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target);
        // Add more Prisma error codes and their messages as needed
        default:
            return "Database error occurred";
    }
}
exports.handlePrismaError = handlePrismaError;
function getStaticPath(error) { }
exports.getStaticPath = getStaticPath;
const isDev = () => process.env.NODE_ENV === "development";
exports.isDev = isDev;
