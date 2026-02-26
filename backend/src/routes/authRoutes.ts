import { Router } from "express";
import { signup, login, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// POST /api/auth/signup  — create account
router.post("/signup", signup);

// POST /api/auth/login   — obtain JWT
router.post("/login", login);

// GET  /api/auth/me      — get current user (protected)
router.get("/me", protect, getMe);

export default router;
