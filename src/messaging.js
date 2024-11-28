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
exports.initMessaging = void 0;
const __1 = require("..");
const message_controller_1 = require("./controller/message.controller");
const admin_controller_1 = require("./controller/admin.controller");
const jsonwebtoken_1 = require("jsonwebtoken");
const utility_1 = require("./utility");
const adminSocketIds = [];
const users = {};
const initMessaging = () => {
    __1.io.use((socket, next) => {
        const appSocket = socket;
        const token = socket.handshake.headers["authorization"];
        try {
            const data = (0, jsonwebtoken_1.verify)(token, process.env.SECRET);
            if (typeof data === "object") {
                appSocket.user = data;
                appSocket.user.isAdmin = Boolean(!data.address);
            }
        }
        catch (err) {
            return next(new Error("NOT AUTHORIZED"));
        }
        next();
    });
    // On client connected
    __1.io.on("connection", (socket) => {
        const appSocket = socket;
        appSocket.on("private_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            //Saving message in the database
            yield message_controller_1.MessageController.storeMessage(data, appSocket.user);
            // Sending message to admin - also emit for sender to loading messages
            __1.io.to(adminSocketIds).emit("private_message", {
                from: appSocket.id,
                message: data.message,
            });
            // Sending message to the user - also emit for sender to loading messages
            __1.io.to(users[data.forId]).emit("private_message", {
                from: appSocket.id,
                message: data.message,
            });
        }));
        if (appSocket.user.isAdmin) {
            // Update socket id in the admin socket id array
            appSocket.on("update_admin", () => {
                adminSocketIds.push(appSocket.id);
            });
            // Get conversations with most recent message from all users
            appSocket.on("admin_get_conversations", () => __awaiter(void 0, void 0, void 0, function* () {
                const conversations = yield admin_controller_1.AdminController.getConversationsWithoutRequest();
                __1.io.to(adminSocketIds).emit("admin_get_conversations", conversations);
            }));
            // Get messages for particular userId
            appSocket.on("admin_get_chat", (forId) => __awaiter(void 0, void 0, void 0, function* () {
                const messages = yield admin_controller_1.AdminController.getChatWithoutRequest(forId);
                __1.io.to(adminSocketIds).emit("admin_get_chat", messages);
            }));
            // Mark messages as ready for userId
            appSocket.on("admin_mark_chat_read", (forId) => __awaiter(void 0, void 0, void 0, function* () {
                yield admin_controller_1.AdminController.markAsChatRead(forId);
                __1.io.to(adminSocketIds).emit("admin_mark_chat_read");
            }));
            // Disconnect admin
            appSocket.on("disconnect", () => {
                delete adminSocketIds[appSocket.user.id];
                if ((0, utility_1.isDev)()) {
                    console.log(`User disconnected: ${appSocket.id}`);
                }
            });
        }
        else {
            // Update socket id in the user socket id array
            appSocket.on("update_user", () => {
                users[appSocket.user.id] = appSocket.id;
                if ((0, utility_1.isDev)()) {
                    console.log("UPDATING_USER ====> ", users);
                }
            });
            // Get messages for connected user
            appSocket.on("user_get_chat", () => __awaiter(void 0, void 0, void 0, function* () {
                const messages = yield admin_controller_1.AdminController.getChatWithoutRequest(appSocket.user.id);
                __1.io.to(users[appSocket.user.id]).emit("user_get_chat", messages);
            }));
            // Disconnect user
            appSocket.on("disconnect", () => {
                delete users[appSocket.user.id];
                if ((0, utility_1.isDev)()) {
                    console.log(`User disconnected: ${appSocket.id}`);
                }
            });
        }
    });
};
exports.initMessaging = initMessaging;
