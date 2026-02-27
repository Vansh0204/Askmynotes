import { AnalysisResult } from "./groqService";
import ChatSessionModel, { IChatSession } from "../models/ChatSession";

export interface ChatSession extends AnalysisResult {
    id: string;
    description: string;
    extracted_text: string;
    created_at: Date;
}

class ChatStore {
    // We'll keep the constants but interact with MongoDB
    private MAX_CHATS = 3;

    async getChats() {
        try {
            const docs = await ChatSessionModel.find().sort({ created_at: -1 });
            return docs.map(doc => this.mapDocToSession(doc));
        } catch (error) {
            console.error("Error fetching chats from MongoDB:", error);
            return [];
        }
    }

    async getChat(id: string) {
        try {
            const doc = await ChatSessionModel.findById(id);
            return doc ? this.mapDocToSession(doc) : null;
        } catch (error) {
            return null;
        }
    }

    async getChatBySubject(subject: string) {
        try {
            const doc = await ChatSessionModel.findOne({
                subject: { $regex: new RegExp(`^${subject}$`, 'i') }
            });
            return doc ? this.mapDocToSession(doc) : null;
        } catch (error) {
            return null;
        }
    }

    async addChat(sessionData: Omit<ChatSession, "id" | "created_at">) {
        try {
            const newDoc = new ChatSessionModel({
                ...sessionData,
            });
            await newDoc.save();
            return this.mapDocToSession(newDoc);
        } catch (error) {
            console.error("Error adding chat to MongoDB:", error);
            throw error;
        }
    }

    async updateChat(id: string, updates: Partial<ChatSession>) {
        try {
            const doc = await ChatSessionModel.findByIdAndUpdate(id, updates, { new: true });
            return doc ? this.mapDocToSession(doc) : null;
        } catch (error) {
            console.error("Error updating chat in MongoDB:", error);
            return null;
        }
    }

    async deleteChat(id: string) {
        try {
            await ChatSessionModel.findByIdAndDelete(id);
        } catch (error) {
            console.error("Error deleting chat from MongoDB:", error);
        }
    }

    private mapDocToSession(doc: IChatSession): ChatSession {
        return {
            id: doc._id.toString(),
            subject: doc.subject,
            file_name: doc.file_name,
            description: doc.description,
            extracted_text: doc.extracted_text,
            topics: doc.topics.map(t => ({
                topic_name: t.topic_name,
                subtopics: t.subtopics,
                summary: t.summary,
                citations: t.citations
            })),
            key_concepts: doc.key_concepts.map(k => ({
                concept: k.concept,
                definition: k.definition,
                citation: k.citation
            })),
            created_at: doc.created_at
        };
    }
}

export const chatStore = new ChatStore();
