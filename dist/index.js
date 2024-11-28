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
exports.io = void 0;
const client_1 = require("@prisma/client");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const AdminRoute_1 = require("./src/routes/admin/AdminRoute");
const UserRoute_1 = require("./src/routes/user/UserRoute");
const messaging_1 = require("./src/messaging");
const prisma = new client_1.PrismaClient();
require("dotenv").config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: { origin: "*", allowedHeaders: ["Authorization"] },
    transports: ["websocket"],
});
(0, messaging_1.initMessaging)();
app.use("/uploads", express_1.default.static("uploads"));
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(function (err, req, res, next) {
    res.send({ message: err.toString() });
    res.end();
});
prisma.appSetting.findMany().then((siteSettings) => __awaiter(void 0, void 0, void 0, function* () {
    if (siteSettings.length === 0) {
        yield prisma.appSetting.create({
            data: {
                helpUrl: "https://support.metamask.io/hc/en-us",
                privacyPolicyUrl: "https://metamask.io/privacy-policy/",
                termsAndConditionUrl: "https://metamask.io/terms-of-use/",
                aboutUs: "https://metamask.io/about/",
                fee: 10,
                adminAddress: "0xC593125f74EBd1452720090e78e368858cFbaA46",
            },
        });
    }
    app.use("/api/admin", AdminRoute_1.AdminRouter);
    app.use("/api/user", UserRoute_1.UserRouter);
    server.listen(process.env.BACKEND_PORT, () => {
        console.log(`LISTENTING ON PORT ${process.env.BACKEND_PORT}`);
    });
}));
