import { Router } from "express";
import { uploadStudyMaterial } from "../controllers/uploadController";

const router = Router();

router.post("/", uploadStudyMaterial);

export default router;
