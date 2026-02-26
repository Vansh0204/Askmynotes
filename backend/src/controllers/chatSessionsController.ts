import { Request, Response } from "express";
import { chatStore } from "../services/chatStore";

export const getAllChats = (req: Request, res: Response) => {
    try {
        const chats = chatStore.getChats();
        res.status(200).json(chats);
    } catch (error: any) {
        res.status(500).json({ error: "Failed to retrieve chats" });
    }
};

export const deleteChat = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        chatStore.deleteChat(id as string);
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to delete chat" });
    }
};
