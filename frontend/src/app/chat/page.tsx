"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

import { useFile } from "@/context/FileContext";

export default function ChatPage() {
    const { selectedFile, clearFile } = useFile();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your note assistant. Upload your notes or ask me anything about your knowledge base.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle file from FileContext (e.g., uploaded from Home page)
    useEffect(() => {
        if (selectedFile) {
            handleFileUploadDirect(selectedFile);
            clearFile(); // Clear it so it doesn't re-trigger
        }
    }, [selectedFile, clearFile]);

    const handleFileUploadDirect = async (file: File) => {
        const uploadMsgId = Date.now().toString();
        setMessages((prev) => [...prev, {
            id: uploadMsgId,
            role: "user",
            content: `Uploaded file: ${file.name}. Analyzing...`
        }]);

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject_name", "Uploaded Material");

        try {
            const response = await fetch("http://localhost:5001/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");

            const result: {
                subject: string;
                topics: { topic_name: string; summary: string; citations?: string[] }[];
                key_concepts: { concept: string; definition: string; citation: string }[];
            } = await response.json();

            let analysisContent = `### Analysis: ${result.subject}\n\n`;
            analysisContent += `**Key Topics:**\n`;
            result.topics.forEach((t) => {
                analysisContent += `- **${t.topic_name}**: ${t.summary}\n`;
                if (t.citations && t.citations.length > 0) {
                    analysisContent += `  *Citations: ${t.citations.map((c: string) => `"${c}"`).join(", ")}*\n`;
                }
            });

            analysisContent += `\n**Key Concepts:**\n`;
            result.key_concepts.forEach((c) => {
                analysisContent += `- **${c.concept}**: ${c.definition} (*Source: "${c.citation}"*)\n`;
            });

            setMessages((prev) => [...prev, {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: analysisContent
            }]);
        } catch {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 3).toString(),
                role: "assistant",
                content: "Error analyzing file. Please ensure it's a valid PDF or text file."
            }]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Simple placeholder for chat logic
        setTimeout(() => {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm currently focused on analyzing your uploaded materials. Upload a PDF for a detailed breakdown!",
            }]);
        }, 1000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadMsgId = Date.now().toString();
        setMessages((prev) => [...prev, {
            id: uploadMsgId,
            role: "user",
            content: `Uploaded file: ${file.name}. Analyzing...`
        }]);

        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject_name", "Uploaded Material");

        try {
            const response = await fetch("http://localhost:5001/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");

            const result: {
                subject: string;
                topics: { topic_name: string; summary: string; citations?: string[] }[];
                key_concepts: { concept: string; definition: string; citation: string }[];
            } = await response.json();

            // Format the result into a clean message
            let analysisContent = `### Analysis: ${result.subject}\n\n`;

            analysisContent += `**Key Topics:**\n`;
            result.topics.forEach((t) => {
                analysisContent += `- **${t.topic_name}**: ${t.summary}\n`;
                if (t.citations && t.citations.length > 0) {
                    analysisContent += `  *Citations: ${t.citations.map((c: string) => `"${c}"`).join(", ")}*\n`;
                }
            });

            analysisContent += `\n**Key Concepts:**\n`;
            result.key_concepts.forEach((c) => {
                analysisContent += `- **${c.concept}**: ${c.definition} (*Source: "${c.citation}"*)\n`;
            });

            setMessages((prev) => [...prev, {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: analysisContent
            }]);
        } catch {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 3).toString(),
                role: "assistant",
                content: "Error analyzing file. Please ensure it's a valid PDF or text file."
            }]);
        } finally {
            setIsAnalyzing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex h-screen bg-[#fdfcfb] overflow-hidden font-['DM_Sans']">
            {/* Sidebar */}
            <div className="w-72 bg-white border-r border-black/5 flex flex-col p-6 hidden md:flex">
                <Link href="/" className="flex items-center gap-2 mb-10 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform text-xs">
                        AMN
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#1a1825]">AskMyNotes</span>
                </Link>

                <button className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors mb-8">
                    <span>+</span> New Chat
                </button>

                <div className="flex-1 overflow-y-auto space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4">Study Sessions</p>
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm font-medium text-indigo-900 cursor-pointer">
                        Current Analysis
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-20 border-b border-black/5 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-lg text-black">Study Assistant</h2>
                        {isAnalyzing && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-lg uppercase tracking-wider animate-pulse">
                                Analyzing...
                            </span>
                        )}
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    <AnimatePresence initial={false}>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex max-w-[85%]",
                                    message.role === "user" ? "ml-auto" : "mr-auto"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                                        message.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-black border border-black/5 rounded-tl-none prose prose-sm max-w-none"
                                    )}
                                >
                                    {message.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 pt-4">
                    <div className="max-w-4xl mx-auto relative bg-white rounded-2xl shadow-xl shadow-black/5 border border-black/5 p-2 flex items-center gap-2">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.txt"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                            className="p-3 text-black/40 hover:text-indigo-600 transition-colors disabled:opacity-50"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask or upload notes..."
                            className="flex-1 bg-transparent px-2 py-3 outline-none text-sm text-black placeholder:text-black/30"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isAnalyzing}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15.8333 2.5L2.5 9.16667L8.33333 11.6667L10.8333 17.5L17.5 4.16667L15.8333 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
