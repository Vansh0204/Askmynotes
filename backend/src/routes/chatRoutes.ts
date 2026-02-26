import { Router } from "express";
import { chatWithStudyMaterial } from "../controllers/chatController";
import { getAllChats, deleteChat } from "../controllers/chatSessionsController";

const router = Router();

router.post("/", chatWithStudyMaterial);
router.get("/sessions", getAllChats);
router.delete("/sessions/:id", deleteChat);

export default router;
