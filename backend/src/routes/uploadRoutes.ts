import { Router } from "express";
import { uploadStudyMaterial } from "../controllers/uploadController";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), uploadStudyMaterial);

export default router;
