import express from "express";
import { checkAuth, login, logout, signup, updateProfile, verifyCode } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requestPasswordReset, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-code", verifyCode); // Новый маршрут для подтверждения кода

router.post("/login", login);
// Здесь добавляем protectRoute для маршрута logout
router.post("/logout", protectRoute, logout);
// Запрос на сброс пароля
router.post("/request-password-reset", requestPasswordReset);

// Сброс пароля
router.post("/reset-password", resetPassword);
router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
