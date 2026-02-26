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
        citations: string[];
    }[];
    key_concepts: {
        concept: string;
        definition: string;
        citation: string;
    }[];
}

export const analyzeStudyMaterial = async (input: AnalysisInput): Promise<AnalysisResult> => {
    const prompt = `
    You are an expert academic assistant analyzing study material.
    
    Input:
    - Subject Name: ${input.subject_name}
    - Subject Description: ${input.optional_description || "N/A"}
    - Uploaded File Name: ${input.file_name}
    - File Text Content: ${input.extracted_text}

    Tasks:
    1. Comprehensive Analysis: Break down the content into a logical hierarchy of topics and subtopics.
    2. Structured Summary: For each major topic, provide a concise summary (2-3 sentences).
    3. Precise Citations: For every topic summary and key concept, include brief verbatim "citations" from the text that support the analysis.
    4. Key Concepts: Identify at least 5 key concepts or definitions.
    
    Output Format (STRICT JSON):
    {
      "subject": "${input.subject_name}",
      "file_name": "${input.file_name}",
      "topics": [
        {
          "topic_name": "String",
          "subtopics": ["String"],
          "summary": "String",
          "citations": ["String segment from text"]
        }
      ],
      "key_concepts": [
        {
          "concept": "String",
          "definition": "String",
          "citation": "String segment from text"
        }
      ]
    }

    Constraints:
    - Do NOT answer questions.
    - Do NOT summarize the entire file as a single block.
    - Be extremely precise with citations—they must exist in the input text.
    - Ensure the JSON is valid and follows the structure exactly.
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
