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
export interface ChatInput {
    subject_name: string;
    extracted_text: string;
    question: string;
    history: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResult {
    answer: string;
    citations: string[];
    confidence: number;
    evidence_snippets: string[];
}

export const chatWithMaterial = async (input: ChatInput): Promise<ChatResult> => {
    const systemPrompt = `
    You are a calm, clear, and professional academic teacher.
    
    Context:
    - Subject: ${input.subject_name}
    - Study Material: ${input.extracted_text}

    STRICT RULES:
    1. STRICT SUBJECT SCOPE: Only answer questions using the provided Study Material.
    2. KEYWORDS: Wrap important academic terms or keywords in <u>...</u> to underline them.
    3. CITATIONS: Every claim MUST be followed by a citation in the format (File: [filename], Page: [number], Line: [approx_line]). If page/line info is missing, use (File: [filename], Section: [Topic]).
    4. REFUSAL: If the answer is not ABSOLUTELY present in the material, use EXACTLY this phrase: "Not found in your notes for ${input.subject_name}".
    5. TONE: Calm, encouraging, and academic.
    
    Output Format (STRICT JSON):
    {
      "answer": "Your detailed answer here, with <u>keywords</u> and citations like (File: bio101.pdf, Page: 4, Line: 12).",
      "citations": ["List of verbatim quotes used for reference"],
      "confidence": 0.95,
      "evidence_snippets": ["Direct snippets from the text that exactly support the answer"]
    }
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...input.history,
                { role: "user", content: input.question },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from Groq API");

        return JSON.parse(content) as ChatResult;
    } catch (error) {
        console.error("Error in chatWithMaterial:", error);
        throw new Error("Failed to process chat message");
    }
};

export interface PracticeInput {
    subject_name: string;
    topic?: string;
    extracted_text: string;
}

export interface PracticeResult {
    mcqs: {
        question: string;
        options: string[];
        correct_option_index: number;
        explanation: string;
        citation: string;
        confidence: number;
    }[];
    short_answers: {
        question: string;
        model_answer: string;
        explanation: string;
        citation: string;
        confidence: number;
    }[];
}

export const generatePracticeQuestions = async (input: PracticeInput): Promise<PracticeResult> => {
    const prompt = `
    You are an expert academic examiner.
    
    Context:
    - Subject: ${input.subject_name}
    ${input.topic ? `- Specific Topic: ${input.topic}` : ""}
    - Study Material: ${input.extracted_text}

    Tasks:
    1. Generate 5 MULTIPLE CHOICE QUESTIONS (MCQs). Each must have 4 options, a correct option index (0-3), a clear explanation, a verbatim citation, and a confidence score (0-1).
    2. Generate 3 SHORT ANSWER QUESTIONS. Each must have a model answer, a detailed explanation, a verbatim citation, and a confidence score (0-1).

    STRICT RULES:
    - All content must come STRICTLY from the provided Study Material.
    - Do NOT use external knowledge.
    - KEYWORDS: Wrap important academic terms or keywords in <u>...</u> to underline them in questions, options, model answers, and explanations.
    - Test understanding and application, not just rote memorization.
    - Vary difficulty (easy to challenging).
    
    Output Format (STRICT JSON):
    {
      "mcqs": [
        {
          "question": "String with <u>underlined</u> keywords",
          "options": ["Option 1", "Option 2 with <u>keyword</u>", "Option 3", "Option 4"],
          "correct_option_index": 0,
          "explanation": "String explaining why with <u>keywords</u>",
          "citation": "Verbatim quote from text",
          "confidence": 0.98
        }
      ],
      "short_answers": [
        {
          "question": "String with <u>underlined</u> keywords",
          "model_answer": "String model answer with <u>keywords</u>",
          "explanation": "String explanation with <u>keywords</u>",
          "citation": "Verbatim quote from text",
          "confidence": 0.95
        }
      ]
    }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) throw new Error("Empty response from Groq API");

        return JSON.parse(content) as PracticeResult;
    } catch (error) {
        console.error("Error in generatePracticeQuestions:", error);
        throw new Error("Failed to generate practice questions");
    }
};
