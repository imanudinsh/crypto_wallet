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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const utility_1 = require("../utility");
const prisma = new client_1.PrismaClient();
exports.MessageController = {
    storeMessage: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const { message, forId } = data;
        const messageData = {
            message,
            forId: user.isAdmin ? forId : user.id,
            isAdminMessage: user.isAdmin,
        };
        let attachment;
        if (data.attachment) {
            const { url, fileName, mediaType } = data.attachment;
            attachment = yield prisma.media.create({
                data: {
                    mediaType: mediaType,
                    fileName: fileName,
                    url: url,
                },
            });
        }
        const createdMessage = yield prisma.message.create({
            data: Object.assign(Object.assign({}, messageData), { mediaId: attachment === null || attachment === void 0 ? void 0 : attachment.id }),
        });
        if ((0, utility_1.isDev)()) {
            console.log("Created Message ===> ", createdMessage);
        }
        return true;
    }),
    markAsChatRead: (forId) => __awaiter(void 0, void 0, void 0, function* () {
        yield admin_controller_1.AdminController.markAsChatRead(forId);
    }),
};
