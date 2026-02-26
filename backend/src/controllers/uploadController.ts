import { Request, Response } from "express";
import { analyzeStudyMaterial } from "../services/groqService";
import { extractTextFromPDF } from "../services/fileService";
import fs from "fs";

export const uploadStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, optional_description } = req.body;
        const file = req.file;

        if (!subject_name || !file) {
            res.status(400).json({ error: "Missing required fields: subject_name or file" });
            return;
        }

        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            extractedText = await extractTextFromPDF(file.path);
        } else {
            // For now, only PDF is supported for text extraction
            // We could add image OCR here later if needed
            extractedText = fs.readFileSync(file.path, "utf-8");
        }

        const analysisResult = await analyzeStudyMaterial({
            subject_name,
            optional_description,
            file_name: file.originalname,
            extracted_text: extractedText,
        });

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.status(200).json(analysisResult);
    } catch (error: any) {
        console.error("Upload controller error:", error);
        // Clean up file on error if it exists
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};
