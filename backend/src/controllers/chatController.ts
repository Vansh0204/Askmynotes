import { Request, Response } from "express";
import { chatWithMaterial } from "../services/groqService";
import { chatStore } from "../services/chatStore";

export const chatWithStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, extracted_text: providedText, question, history } = req.body;

        if (!subject_name || !question) {
            res.status(400).json({ error: "Missing required fields: subject_name or question" });
            return;
        }

        // Always fetch the latest content from the store to ensure cumulative uploads are included
        const session = await chatStore.getChatBySubject(subject_name);
        const finalExtractedText = session ? session.extracted_text : providedText;

        if (!finalExtractedText) {
            res.status(400).json({ error: `No study material found for subject: ${subject_name}` });
            return;
        }

        const result = await chatWithMaterial({
            subject_name,
            extracted_text: finalExtractedText,
            question,
            history: history || [],
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Chat controller error:", error);
        res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
};
