import { Request, Response } from "express";
import { analyzeStudyMaterial } from "../services/groqService";

export const uploadStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, optional_description, file_name, extracted_text } = req.body;

        if (!subject_name || !file_name || !extracted_text) {
            res.status(400).json({ error: "Missing required fields: subject_name, file_name, or extracted_text" });
            return;
        }

        const analysisResult = await analyzeStudyMaterial({
            subject_name,
            optional_description,
            file_name,
            extracted_text,
        });

        res.status(200).json(analysisResult);
    } catch (error: any) {
        console.error("Upload controller error:", error);
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};
