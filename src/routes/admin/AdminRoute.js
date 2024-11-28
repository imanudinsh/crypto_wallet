"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
const express_1 = require("express");
const admin_validator_1 = require("../../validator/admin.validator");
const admin_controller_1 = require("../../controller/admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_controller_1 = require("../../controller/user.controller");
const utility_1 = require("../../utility");
const router = (0, express_1.Router)();
exports.AdminRouter = router;
if ((0, utility_1.isDev)()) {
    router.post("/", admin_controller_1.AdminController.createUser);
}
router.post("/login", admin_validator_1.loginAdminValidationMiddleware, admin_controller_1.AdminController.loginAdmin);
router.post("/upload", auth_middleware_1.checkAuth, utility_1.upload.single("file"), user_controller_1.UserController.uploadAttachment);
router.get("/settings", auth_middleware_1.checkAuth, admin_controller_1.AdminController.updateSettings);
router.patch("/settings", auth_middleware_1.checkAuth, admin_controller_1.AdminController.updateSettings);
router.get("/users", auth_middleware_1.checkAuth, admin_controller_1.AdminController.users);
router.get("/conversations", auth_middleware_1.checkAuth, admin_controller_1.AdminController.getConversations);
router.delete("/conversations", auth_middleware_1.checkAuth, admin_controller_1.AdminController.deleteConversation);
router.get("/users/deactivate/:userId", auth_middleware_1.checkAuth, admin_controller_1.AdminController.deactivateUser);
router.get("/users/block/:userId", auth_middleware_1.checkAuth, admin_controller_1.AdminController.blockUser);
router.get("/users/unblock/:userId", auth_middleware_1.checkAuth, admin_controller_1.AdminController.unblockUser);
router.get("/users/activate/:userId", auth_middleware_1.checkAuth, admin_controller_1.AdminController.activateUser);
router.get("/tokens/:address/:chainId", auth_middleware_1.checkAuth, user_controller_1.UserController.tokens);
