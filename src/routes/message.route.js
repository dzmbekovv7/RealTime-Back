import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, getUnreadCounts } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/unread-counts", protectRoute, getUnreadCounts);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
