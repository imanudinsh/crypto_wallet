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
exports.AdminController = void 0;
const client_1 = require("@prisma/client");
const utility_1 = require("../utility");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma = new client_1.PrismaClient();
exports.AdminController = {
    createUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { username, password, secret } = req.body;
            if (process.env["SECRET"] === secret) {
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const user = yield prisma.admin.create({
                    data: { username, password: hashedPassword },
                });
                return (0, utility_1.sendSuccessResponse)(res, Object.assign({}, user));
            }
            return (0, utility_1.sendErrorResponse)(res, "Not authenticated");
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    loginAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password } = req.body;
        const admin = yield prisma.admin.findFirst({
            where: { username: username },
        });
        if (!admin) {
            return (0, utility_1.sendErrorResponse)(res, "Username or password invalid", 400);
        }
        const isValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isValid) {
            return (0, utility_1.sendErrorResponse)(res, "Username or password invalid", 400);
        }
        const token = (0, jsonwebtoken_1.sign)(Object.assign(Object.assign({}, admin), { password: undefined }), process.env.SECRET);
        return (0, utility_1.sendSuccessResponse)(res, token, 200);
    }),
    users: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield prisma.user.findMany({ orderBy: { id: "asc" } });
        return (0, utility_1.sendSuccessResponse)(res, users, 200);
    }),
    deactivateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const users = yield prisma.user.update({
            where: { id: Number(userId) },
            data: { isDeactivated: true },
        });
        return (0, utility_1.sendSuccessResponse)(res, users, 200);
    }),
    activateUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const users = yield prisma.user.update({
            where: { id: Number(userId) },
            data: { isDeactivated: false },
        });
        return (0, utility_1.sendSuccessResponse)(res, users, 200);
    }),
    blockUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const users = yield prisma.user.update({
            where: { id: Number(userId) },
            data: { isTransactionBlocked: true },
        });
        return (0, utility_1.sendSuccessResponse)(res, users, 200);
    }),
    unblockUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        const users = yield prisma.user.update({
            where: { id: Number(userId) },
            data: { isTransactionBlocked: false },
        });
        return (0, utility_1.sendSuccessResponse)(res, users, 200);
    }),
    getConversations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let groupedMessagesByForId;
        const messages = yield prisma.message.findMany({
            distinct: ["forId"],
            orderBy: {
                timestamp: "desc",
            },
            include: {
                for: true,
                attachment: true,
            },
        });
        messages.reverse();
        groupedMessagesByForId = messages.reduce((acc, message) => {
            const { for: { address }, } = message;
            if (!acc[address]) {
                acc[address] = message;
            }
            return acc;
        }, {});
        return (0, utility_1.sendSuccessResponse)(res, groupedMessagesByForId, 200);
    }),
    updateSettings: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const updateSettings = req.body;
        try {
            const appSetting = yield prisma.appSetting.findFirst();
            const settings = yield prisma.appSetting.update({
                where: { id: appSetting === null || appSetting === void 0 ? void 0 : appSetting.id },
                data: updateSettings,
            });
            return (0, utility_1.sendSuccessResponse)(res, settings, 200);
        }
        catch (error) {
            return res.status(400).send({ message: error.toString() });
        }
    }),
    settings: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const appSetting = yield prisma.appSetting.findFirst();
            return (0, utility_1.sendSuccessResponse)(res, appSetting, 200);
        }
        catch (error) {
            return res.status(400).send({ message: error.toString() });
        }
    }),
    getConversationsWithoutRequest: () => __awaiter(void 0, void 0, void 0, function* () {
        let groupedMessagesByForId;
        const messages = yield prisma.message.findMany({
            distinct: ["forId"],
            orderBy: {
                timestamp: "desc",
            },
            include: {
                for: true,
                attachment: true,
            },
        });
        groupedMessagesByForId = messages.reduce((acc, message) => {
            const { for: { address }, } = message;
            acc[address] = message;
            return acc;
        }, {});
        return groupedMessagesByForId;
    }),
    getChatWithoutRequest: (forId) => __awaiter(void 0, void 0, void 0, function* () {
        const messages = yield prisma.message.findMany({
            where: { forId: forId },
            orderBy: {
                timestamp: "desc",
            },
            include: {
                for: true,
                attachment: true,
            },
        });
        return messages;
    }),
    markAsChatRead: (forId) => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.message.updateMany({
            where: { forId: forId },
            data: { seen: true },
        });
    }),
    deleteConversation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.message.deleteMany();
        return (0, utility_1.sendSuccessResponse)(res, null, 200);
    }),
};
