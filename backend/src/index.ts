import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import chatRoutes from "./routes/chatRoutes";
import multer from "multer";
import path from "path";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ─── Multer Config ────────────────────────────────────────────────────────────
const upload = multer({ dest: "uploads/" });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "AskMyNotes API running 🚀" });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes — /api/auth/signup  /api/auth/login  /api/auth/me
app.use("/api/auth", authRoutes);

// Upload & Analysis routes
app.use("/api/upload", uploadRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Study routes
import studyRoutes from "./routes/studyRoutes";
app.use("/api/study", studyRoutes);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});