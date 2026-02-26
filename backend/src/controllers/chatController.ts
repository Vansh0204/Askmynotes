import { Request, Response } from "express";
import { chatWithMaterial } from "../services/groqService";

export const chatWithStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, extracted_text, question, history } = req.body;

        if (!subject_name || !extracted_text || !question) {
            res.status(400).json({ error: "Missing required fields: subject_name, extracted_text, or question" });
            return;
        }

        const result = await chatWithMaterial({
            subject_name,
            extracted_text,
            question,
            history: history || [],
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Chat controller error:", error);
        res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
};
