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
exports.UserController = void 0;
const client_1 = require("@prisma/client");
const utility_1 = require("../utility");
const web3Utilities_1 = require("../web3Utilities");
const jsonwebtoken_1 = require("jsonwebtoken");
const moralis_1 = __importDefault(require("moralis"));
const prisma = new client_1.PrismaClient();
moralis_1.default.start({
    apiKey: process.env.MORALIS_API_KEY,
});
const getMediaType = (extension) => {
    if (extension.includes("png") ||
        extension.includes("jpg") ||
        extension.includes("jpeg") ||
        extension.includes("webp") ||
        extension.includes("gif")) {
        return "image";
    }
    if (extension.includes("mp4") ||
        extension.includes("mkv") ||
        extension.includes("mov") ||
        extension.includes("avi")) {
        return "video";
    }
    return "file";
};
exports.UserController = {
    createUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address, hash, message } = req.body;
            const isValid = (0, web3Utilities_1.verifyPersonalSign)({ message, hash, address });
            if (!isValid) {
                return (0, utility_1.sendErrorResponse)(res, "Authentication error", 400);
            }
            const existingUser = yield prisma.user.findFirst({
                where: { address: { equals: address } },
            });
            if ((0, utility_1.isDev)()) {
                console.log(existingUser);
            }
            if (existingUser) {
                return yield exports.UserController.loginUser(req, res);
            }
            const user = yield prisma.user.create({ data: { address } });
            const token = (0, jsonwebtoken_1.sign)(user, process.env.SECRET);
            return (0, utility_1.sendSuccessResponse)(res, Object.assign(Object.assign({}, user), { token: token }));
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    addAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address: mainAddress } = req.user;
            const { address, hash, message } = req.body;
            const isValid = (0, web3Utilities_1.verifyPersonalSign)({ message, hash, address });
            if (!isValid) {
                return (0, utility_1.sendErrorResponse)(res, "Authentication error", 400);
            }
            const user = yield prisma.user.findFirst({
                where: { address: { equals: mainAddress, mode: "insensitive" } },
            });
            if (user) {
                const alreadyExist = user.subAddress.find((_address) => _address === address);
                const isMainAddress = mainAddress.toLowerCase() === address.toLowerCase();
                if (!alreadyExist && !isMainAddress) {
                    user.subAddress.push(address);
                }
                const updatedUser = yield prisma.user.update({
                    where: { address: user.address },
                    data: user,
                });
                return (0, utility_1.sendSuccessResponse)(res, Object.assign({}, updatedUser));
            }
            return (0, utility_1.sendErrorResponse)(res, "Something went wrong", 400);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    backedUp: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address } = req.user;
            const user = yield prisma.user.findFirst({
                where: { address: { equals: address, mode: "insensitive" } },
            });
            if (user) {
                user.seedPhraseBackedUp = true;
                const updatedUser = yield prisma.user.update({
                    where: { address: user.address },
                    data: user,
                });
                return (0, utility_1.sendSuccessResponse)(res, Object.assign({}, updatedUser));
            }
            return (0, utility_1.sendErrorResponse)(res, "Something went wrong", 400);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    loginUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address, hash, message } = req.body;
            const isValid = (0, web3Utilities_1.verifyPersonalSign)({ message, hash, address });
            if (!isValid) {
                return (0, utility_1.sendErrorResponse)(res, "Authentication error", 400);
            }
            const user = yield prisma.user.findFirst({ where: { address } });
            if (user) {
                const token = (0, jsonwebtoken_1.sign)(user, process.env.SECRET);
                if ((0, utility_1.isDev)()) {
                    console.log("SIGNING WITH ===> ", process.env.SECRET);
                    console.log("USER TOKEN====> ", token);
                }
                return (0, utility_1.sendSuccessResponse)(res, Object.assign(Object.assign({}, user), { token }));
            }
            return (0, utility_1.sendErrorResponse)(res, "Wallet not found", 404);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    uploadAttachment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send({ message: "Please upload file" });
            }
            const fileNamePart = file.path.split(".");
            const mediaType = getMediaType(fileNamePart[fileNamePart.length - 1]);
            return (0, utility_1.sendSuccessResponse)(res, {
                url: `${req.protocol}://${req.headers.host}/${file.path}`,
                fileName: file.filename,
                mediaType: mediaType,
            });
        }
        catch (error) {
            return res.status(400).send({ message: error.toString() });
        }
    }),
    getFeePercentage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const siteSettings = yield prisma.appSetting.findFirst();
            return (0, utility_1.sendSuccessResponse)(res, {
                fee: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.fee,
                adminAddress: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.adminAddress,
            });
        }
        catch (error) {
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    settings: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const siteSettings = yield prisma.appSetting.findFirst();
            return (0, utility_1.sendSuccessResponse)(res, {
                helpUrl: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.helpUrl,
                tcUrl: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.termsAndConditionUrl,
                ppUrl: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.privacyPolicyUrl,
                about: siteSettings === null || siteSettings === void 0 ? void 0 : siteSettings.aboutUs,
            });
        }
        catch (error) {
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    tokens: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address, chainId } = req.params;
            const tokens = yield moralis_1.default.EvmApi.wallets.getWalletTokenBalancesPrice({
                address: address,
                chain: chainId,
            });
            if ((0, utility_1.isDev)()) {
                console.log(JSON.stringify(tokens, null, 4));
            }
            return (0, utility_1.sendSuccessResponse)(res, [...tokens.result]);
        }
        catch (error) {
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    tokenTransaction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address, tokenAddress, chainId } = req.params;
            const transfers = yield moralis_1.default.EvmApi.token.getWalletTokenTransfers({
                address: address,
                chain: chainId,
                contractAddresses: [tokenAddress],
            });
            if ((0, utility_1.isDev)()) {
                console.log(JSON.stringify(transfers, null, 4));
            }
            return (0, utility_1.sendSuccessResponse)(res, transfers.result);
        }
        catch (error) {
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    walletTransaction: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address, tokenAddress, chainId } = req.params;
            const activities = yield moralis_1.default.EvmApi.transaction.getWalletTransactions({
                address: address,
                chain: chainId,
                limit: 100,
            });
            if ((0, utility_1.isDev)()) {
                console.log(JSON.stringify(activities, null, 4));
            }
            return (0, utility_1.sendSuccessResponse)(res, activities.result);
        }
        catch (error) {
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { address } = req.params;
            yield prisma.user.delete({ where: { address: address } });
            return (0, utility_1.sendSuccessResponse)(res, "User deleted successfully");
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                const message = (0, utility_1.handlePrismaError)(error);
                return (0, utility_1.sendErrorResponse)(res, message, 400);
            }
            return (0, utility_1.sendErrorResponse)(res, error.toString());
        }
    }),
};
