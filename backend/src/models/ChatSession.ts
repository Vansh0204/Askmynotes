import mongoose, { Schema, Document } from "mongoose";

export interface IChatSession extends Document {
    subject: string;
    file_name: string;
    description: string;
    extracted_text: string;
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
    created_at: Date;
}

const ChatSessionSchema: Schema = new Schema({
    subject: { type: String, required: true },
    file_name: { type: String, required: true },
    description: { type: String, default: "" },
    extracted_text: { type: String, required: true },
    topics: [{
        topic_name: String,
        subtopics: [String],
        summary: String,
        citations: [String]
    }],
    key_concepts: [{
        concept: String,
        definition: String,
        citation: String
    }],
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
