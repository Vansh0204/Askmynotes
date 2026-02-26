import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface AnalysisInput {
    subject_name: string;
    optional_description?: string;
    file_name: string;
    extracted_text: string;
}

export interface AnalysisResult {
    subject: string;
    file_name: string;
    topics: {
        topic_name: string;
        subtopics: string[];
        summary: string;
    }[];
    key_concepts: string[];
}

export const analyzeStudyMaterial = async (input: AnalysisInput): Promise<AnalysisResult> => {
    const prompt = `
    You are processing uploaded study material.

    Input:
    - Subject Name: ${input.subject_name}
    - Subject Description: ${input.optional_description || "N/A"}
    - Uploaded File Name: ${input.file_name}
    - File Text Content: ${input.extracted_text}

    Tasks:
    1. Analyze the content.
    2. Identify major topics and subtopics.
    3. Generate a structured topic list.
    4. Extract key concepts and definitions.
    5. Tag sections with possible topic labels.
    6. Return output in structured JSON format:

    {
      "subject": "",
      "file_name": "",
      "topics": [
        {
          "topic_name": "",
          "subtopics": [],
          "summary": ""
        }
      ],
      "key_concepts": []
    }

    Do NOT answer questions.
    Do NOT summarize the entire file.
    Only analyze structure and topics.
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from Groq API");
        }

        return JSON.parse(content) as AnalysisResult;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw new Error("Failed to analyze study material");
    }
};
