import { Request, Response } from "express";
import { analyzeStudyMaterial } from "../services/groqService";
import { extractTextFromPDF } from "../services/fileService";
import fs from "fs";
import { chatStore } from "../services/chatStore";

export const uploadStudyMaterial = async (req: Request, res: Response) => {
    try {
        const { subject_name, optional_description } = req.body;
        const file = req.file;

        if (!subject_name || !file) {
            res.status(400).json({ error: "Missing required fields: subject_name or file" });
            return;
        }

        const existingChat = await chatStore.getChatBySubject(subject_name);
        const currentChats = await chatStore.getChats();

        if (!existingChat && currentChats.length >= 3) {
            res.status(400).json({ error: "Maximum of 3 unique subjects allowed. Please update an existing subject or delete one." });
            return;
        }

        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            extractedText = await extractTextFromPDF(file.path);
        } else {
            extractedText = fs.readFileSync(file.path, "utf-8");
        }

        // 1. Analyze ONLY the new content (Non-blocking fallback)
        let newAnalysisResult;
        try {
            newAnalysisResult = await analyzeStudyMaterial({
                subject_name,
                optional_description: optional_description || existingChat?.description,
                file_name: file.originalname,
                extracted_text: extractedText,
            });
        } catch (error) {
            console.error("AI Analysis failed (likely rate limit), falling back to raw text:", error);
            newAnalysisResult = {
                subject: subject_name,
                file_name: file.originalname,
                topics: [],
                key_concepts: []
            };
        }

        let result;
        if (existingChat) {
            // 2. Merge with existing data
            const combinedText = `${existingChat.extracted_text}\n\n--- Source: ${file.originalname} ---\n${extractedText}`;
            const combinedFileNames = `${existingChat.file_name}, ${file.originalname}`;

            // Smart merge topics: combine subtopics and citations for existing topics
            const topicMap = new Map();
            existingChat.topics.forEach(t => topicMap.set(t.topic_name.toLowerCase(), { ...t }));

            newAnalysisResult.topics.forEach(t => {
                const key = t.topic_name.toLowerCase();
                if (topicMap.has(key)) {
                    const existing = topicMap.get(key);
                    existing.subtopics = Array.from(new Set([...existing.subtopics, ...t.subtopics]));
                    existing.citations = [...(existing.citations || []), ...(t.citations || [])].slice(-5);
                    // Keep the longer summary or merge? Let's keep the new one as it's more fresh, 
                    // or better, just keep the existing one if it's longer.
                    if (t.summary.length > existing.summary.length) existing.summary = t.summary;
                } else {
                    topicMap.set(key, t);
                }
            });

            // Smart merge concepts: avoid exact name duplicates
            const conceptMap = new Map();
            existingChat.key_concepts.forEach(c => conceptMap.set(c.concept.toLowerCase(), c));
            newAnalysisResult.key_concepts.forEach(c => conceptMap.set(c.concept.toLowerCase(), c));

            result = await chatStore.updateChat(existingChat.id, {
                topics: Array.from(topicMap.values()).slice(-15), // Keep a reasonable count
                key_concepts: Array.from(conceptMap.values()).slice(-15),
                extracted_text: combinedText,
                file_name: combinedFileNames,
                description: optional_description || existingChat.description
            });
        } else {
            // Store new subject
            result = await chatStore.addChat({
                ...newAnalysisResult,
                description: optional_description || "",
                extracted_text: extractedText,
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(file.path);

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Upload controller error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message || "Failed to process upload" });
    }
};