"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menu_controller_1 = require("./menu.controller");
const router = (0, express_1.Router)();
router.get("/", menu_controller_1.listMenuItems);
router.get("/:id", menu_controller_1.getMenuItemById);
router.post("/", /* authMiddleware, */ menu_controller_1.createMenuItem);
exports.default = router;
//# sourceMappingURL=menu.routes.js.map