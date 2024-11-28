"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthAndReturn = exports.checkAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const utility_1 = require("../utility");
function checkAuth(req, res, next) {
    var _a, _b, _c;
    const token = (_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", "");
    try {
        if ((0, utility_1.isDev)()) {
            console.log("TOKEN ===> ", token);
        }
        const payload = (0, jsonwebtoken_1.verify)(token !== null && token !== void 0 ? token : "", (_c = process.env.SECRET) !== null && _c !== void 0 ? _c : "");
        if (payload) {
            req.user = (0, jsonwebtoken_1.decode)(token !== null && token !== void 0 ? token : "");
            return next();
        }
    }
    catch (error) {
        return (0, utility_1.sendErrorResponse)(res, "Authentication error");
    }
}
exports.checkAuth = checkAuth;
function checkAuthAndReturn(token) {
    var _a;
    try {
        if ((0, utility_1.isDev)()) {
            console.log("TOKEN ===> ", token);
        }
        const payload = (0, jsonwebtoken_1.verify)(token !== null && token !== void 0 ? token : "", (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : "");
        if (payload) {
            return (0, jsonwebtoken_1.decode)(token !== null && token !== void 0 ? token : "");
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
exports.checkAuthAndReturn = checkAuthAndReturn;
