import { Request, Response } from "express";
import { analyzeStudyMaterial } from "../services/groqService";
import { extractTextFromPDF } from "../services/fileService";
import fs from "fs";
import { chatStore } from "../services/chatStore";

export const uploadStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, optional_description } = req.body;
        const file = req.file;

        if (chatStore.getChats().length >= 3) {
            res.status(400).json({ error: "Maximum of 3 chats allowed. Please delete an existing chat." });
            return;
        }

        if (!subject_name || !file) {
            res.status(400).json({ error: "Missing required fields: subject_name or file" });
            return;
        }

        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            extractedText = await extractTextFromPDF(file.path);
        } else {
            extractedText = fs.readFileSync(file.path, "utf-8");
        }

        const analysisResult = await analyzeStudyMaterial({
            subject_name,
            optional_description,
            file_name: file.originalname,
            extracted_text: extractedText,
        });

        // Store in chatStore
        const newChat = chatStore.addChat({
            ...analysisResult,
            description: optional_description || "",
            extracted_text: extractedText,
        });

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.status(200).json(newChat);
    } catch (error: any) {
        console.error("Upload controller error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};
