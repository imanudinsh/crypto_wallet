"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_validator_1 = require("../../validator/user.validator");
const user_controller_1 = require("../../controller/user.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const utility_1 = require("../../utility");
const router = (0, express_1.Router)();
exports.UserRouter = router;
if (process.env.NODE_ENV === "development") {
    router.delete("/:address", user_controller_1.UserController.deleteUser);
}
router.post("/register", user_validator_1.createUserValidationMiddleware, user_controller_1.UserController.createUser);
router.post("/addAccount", user_validator_1.createUserValidationMiddleware, auth_middleware_1.checkAuth, user_controller_1.UserController.addAccount);
router.post("/login", user_validator_1.createUserValidationMiddleware, user_controller_1.UserController.loginUser);
router.get("/settings", user_controller_1.UserController.settings);
router.get("/fee", user_controller_1.UserController.getFeePercentage);
router.put("/backedup", auth_middleware_1.checkAuth, user_controller_1.UserController.backedUp);
router.get("/wallet/transactions/:address/:chainId", auth_middleware_1.checkAuth, user_controller_1.UserController.walletTransaction);
router.get("/tokens/:address/:chainId", auth_middleware_1.checkAuth, user_controller_1.UserController.tokens);
router.get("/tokens/transfers/:address/:tokenAddress/:chainId", auth_middleware_1.checkAuth, user_controller_1.UserController.tokenTransaction);
router.post("/upload", auth_middleware_1.checkAuth, utility_1.upload.single("file"), user_controller_1.UserController.uploadAttachment);
