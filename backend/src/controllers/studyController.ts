import { Request, Response } from "express";
import { generatePracticeQuestions } from "../services/groqService";

export const getPracticeQuestions = async (req: Request, res: Response) => {
    try {
        const { subject_name, topic, extracted_text } = req.body;

        if (!subject_name || !extracted_text) {
            res.status(400).json({ error: "Missing subject_name or extracted_text" });
            return;
        }

        const result = await generatePracticeQuestions({
            subject_name,
            topic,
            extracted_text,
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Practice generation error:", error);
        res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
};
