import { AnalysisResult } from "./groqService";
import { v4 as uuidv4 } from "uuid";

export interface ChatSession extends AnalysisResult {
    id: string;
    description: string;
    extracted_text: string;
    created_at: Date;
}

class ChatStore {
    private chats: ChatSession[] = [];
    private MAX_CHATS = 3;

    getChats() {
        return this.chats;
    }

    getChat(id: string) {
        return this.chats.find(c => c.id === id);
    }

    addChat(sessionData: Omit<ChatSession, "id" | "created_at">) {
        if (this.chats.length >= this.MAX_CHATS) {
            throw new Error("Maximum of 3 chats allowed. Please delete an existing chat.");
        }
        const newChat: ChatSession = {
            ...sessionData,
            id: uuidv4(),
            created_at: new Date(),
        };
        this.chats.push(newChat);
        return newChat;
    }

    deleteChat(id: string) {
        this.chats = this.chats.filter(c => c.id !== id);
    }
}

export const chatStore = new ChatStore();
