import { Router } from "express";
import { getPracticeQuestions } from "../controllers/studyController";

const router = Router();

router.post("/practice", getPracticeQuestions);

export default router;
