"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    DoodlePencil,
    DoodleStar,
    DoodlePaperPlane,
    DoodleNotebook,
    DoodleLightbulb,
} from "@/components/ui/doodle-elements";

const COLORS = {
    red: "#ef4444",
    blue: "#3b82f6",
    yellow: "#fbbf24",
    pink: "#f472b6",
    green: "#10b981",
    purple: "#8b5cf6",
    black: "#1a1825",
};

interface ChatSession {
    id: string;
    subject: string;
    description: string;
    extracted_text: string;
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

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    confidence?: number;
    evidence?: string[];
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: () => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export default function ChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({});
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchSessions = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5003/api/chat/sessions");
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
                if (data.length > 0 && !activeSession) {
                    setActiveSession(data[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    }, [activeSession]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        scrollToBottom();
    }, [messagesBySession, activeSession]);

    const activeMessages = activeSession ? (messagesBySession[activeSession.id] || [{
        id: "start",
        role: "assistant",
        content: `Ready to teach you about **${activeSession.subject}**. I've indexed ${activeSession.topics.length} key topics. What would you like to explore?`
    }]) : [];

    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || !activeSession) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
        };

        setMessagesBySession(prev => ({
            ...prev,
            [activeSession.id]: [...(prev[activeSession.id] || []), userMsg]
        }));
        if (!customInput) setInput("");
        setIsProcessing(true);

        try {
            const history = (messagesBySession[activeSession.id] || []).map(m => ({ role: m.role, content: m.content }));

            // Add topic scoping to the question if selected
            const finalQuestion = selectedTopic
                ? `Researching specifically about "${selectedTopic}": ${textToSend}`
                : textToSend;

            const response = await fetch("http://localhost:5003/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_name: activeSession.subject,
                    extracted_text: activeSession.extracted_text,
                    question: finalQuestion,
                    history: history,
                }),
            });

            if (!response.ok) throw new Error("Chat failed");

            const result = await response.json();
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: result.answer,
                confidence: result.confidence,
                evidence: result.evidence_snippets
            };

            setMessagesBySession(prev => ({
                ...prev,
                [activeSession.id]: [...(prev[activeSession.id] || []), aiMsg]
            }));
            speak(result.answer);
        } catch {
            setMessagesBySession(prev => ({
                ...prev,
                [activeSession.id]: [...(prev[activeSession.id] || []), {
                    id: "error",
                    role: "assistant",
                    content: "I'm having trouble connecting to my knowledge base right now."
                }]
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:5003/api/chat/sessions/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== id));
                if (activeSession?.id === id) setActiveSession(null);
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const speak = (text: string) => {
        const cleanText = text.replace(/\[.*?\]/g, "").replace(/<u>/g, "").replace(/<\/u>/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onstart = () => { setIsRecording(true); setTranscript(""); };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const curr = Array.from(Object.values(event.results)).map(r => r[0].transcript).join("");
            setTranscript(curr);
        };
        recognition.onend = () => {
            setIsRecording(false);
            if (transcript.trim()) handleSend(transcript);
        };
        recognition.start();
        recognitionRef.current = recognition;
    };

    const renderText = (text: string) => {
        // Simple <u> parsing
        const parts = text.split(/(<u>.*?<\/u>)/g);
        return parts.map((part, i) => {
            if (part.startsWith("<u>") && part.endsWith("</u>")) {
                return <u key={i} className="decoration-indigo-500/50 underline-offset-2">{part.slice(3, -4)}</u>;
            }
            return part;
        });
    };

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden relative">
            {/* Background Doodles and Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
                <div className="absolute top-20 left-10 rotate-12"><DoodleNotebook color={COLORS.blue} /></div>
                <div className="absolute bottom-20 left-40 -rotate-12"><DoodleStar color={COLORS.yellow} /></div>
                <div className="absolute top-1/2 right-20 rotate-45"><DoodlePaperPlane color={COLORS.pink} /></div>
                <div className="absolute top-40 right-1/4 -rotate-12"><DoodleLightbulb color={COLORS.purple} /></div>
                <div className="absolute bottom-10 right-10 rotate-12"><DoodlePencil color={COLORS.red} /></div>
            </div>

            {/* DASHBOARD SIDEBAR */}
            <div className="w-80 bg-white border-r border-black/5 flex flex-col hidden lg:flex relative z-10 shadow-xl shadow-black/[0.02]">
                <div className="p-8 pb-4">
                    <Link href="/" className="flex items-center gap-3 mb-10 group">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#1a1825]">Study Desk</span>
                    </Link>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4 px-2">Active Notes ({sessions.length}/3)</p>
                        {sessions.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => setActiveSession(s)}
                                className={cn(
                                    "group relative p-4 rounded-2xl cursor-pointer transition-all border",
                                    activeSession?.id === s.id
                                        ? "bg-indigo-50 border-indigo-100/50 shadow-sm"
                                        : "bg-transparent border-transparent hover:bg-black/5"
                                )}
                            >
                                <p className={cn("font-bold truncate pr-6", activeSession?.id === s.id ? "text-indigo-900" : "text-black/70")}>{s.subject}</p>
                                <p className="text-[10px] opacity-40 font-medium truncate">{s.file_name}</p>
                                <button
                                    onClick={(e) => deleteSession(s.id, e)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            </div>
                        ))}

                        {sessions.length < 3 && (
                            <Link href="/" className="flex items-center justify-center p-4 border-2 border-dashed border-black/5 rounded-2xl text-black/20 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all mt-4">
                                <span className="text-xs font-bold uppercase tracking-widest">+ Upload Note</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Topics Scoping */}
                <div className="mt-8 flex-1 overflow-y-auto px-8 pb-8">
                    {activeSession && (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-4">Jump to Topic</p>
                            <div className="space-y-2">
                                <div
                                    onClick={() => setSelectedTopic(null)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border",
                                        !selectedTopic ? "bg-black text-white border-black" : "bg-white border-black/5 hover:border-black/20"
                                    )}
                                >
                                    Global Context
                                </div>
                                {activeSession.topics.map((t, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedTopic(t.topic_name)}
                                        className={cn(
                                            "px-4 py-3 rounded-xl text-[11px] font-medium cursor-pointer transition-all border leading-tight",
                                            selectedTopic === t.topic_name
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                                : "bg-white border-black/5 hover:border-indigo-200"
                                        )}
                                    >
                                        {t.topic_name}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col relative bg-white">
                {activeSession ? (
                    <>
                        <header className="h-20 border-b border-black/5 flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl z-20">
                            <div className="flex flex-col">
                                <h2 className="font-extrabold text-xl text-[#1a1825]">{activeSession.subject}</h2>
                                <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest">
                                    {selectedTopic ? `Browsing: ${selectedTopic}` : "Full Context Active"}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-tight">Confidence</p>
                                    <div className="w-24 h-1.5 bg-black/5 rounded-full mt-1 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "95%" }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {activeMessages.map((m) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex flex-col group",
                                            m.role === "user" ? "items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[75%] p-6 rounded-3xl text-[15px] leading-relaxed shadow-sm",
                                            m.role === "user"
                                                ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                                                : "bg-[#f8f9fb] text-[#2a2a2e] border border-black/5 rounded-tl-none"
                                        )}>
                                            {renderText(m.content)}
                                        </div>

                                        {m.role === "assistant" && m.id !== "start" && (
                                            <div className="mt-4 w-full max-w-[75%] space-y-3">
                                                {/* Confidence & Evidence */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 bg-black/5 h-[1px]" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 italic">AI Verification Layer</span>
                                                    <div className="flex-1 bg-black/5 h-[1px]" />
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[10px] font-bold text-green-700">{(m.confidence || 0.95 * 100).toFixed(0)}% Confidence</span>
                                                    </div>
                                                    {m.evidence?.map((ev, i) => (
                                                        <div key={i} className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-indigo-400">
                                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                            </svg>
                                                            <span className="text-[10px] font-bold text-indigo-700">Evidence Snippet Available</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {m.evidence && m.evidence.length > 0 && (
                                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                                        <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-2">Original Reference</p>
                                                        <p className="text-[11px] italic text-amber-900/60 leading-relaxed">&ldquo;{m.evidence[0]}&rdquo;</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {isProcessing && (
                                <div className="flex gap-2 p-6 bg-black/5 rounded-3xl w-20 justify-center animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-10 pt-4">
                            {isRecording && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-4xl mx-auto mb-4 bg-indigo-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl shadow-indigo-600/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <motion.div key={i} animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} className="w-1 bg-white rounded-full" />
                                            ))}
                                        </div>
                                        <p className="font-bold text-sm italic">{transcript || "Speak clearly into your mic..."}</p>
                                    </div>
                                    <button onClick={setIsRecording.bind(null, false)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">Stop</button>
                                </motion.div>
                            )}
                            <div className="max-w-4xl mx-auto flex items-center gap-4 bg-[#f1f2f4] p-3 rounded-[2.5rem] border border-black/5 shadow-inner">
                                <button
                                    onClick={startRecording}
                                    className={cn(
                                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                        isRecording ? "bg-red-500 text-white scale-110" : "bg-white text-black hover:scale-105"
                                    )}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    placeholder={`Ask about ${selectedTopic || activeSession.subject}...`}
                                    className="flex-1 bg-transparent px-4 py-4 outline-none font-medium text-black placeholder:text-black/20"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-8 border-2 border-dashed border-indigo-200"
                        >
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </motion.div>
                        <h1 className="text-4xl font-extrabold text-[#1a1825] mb-4 tracking-tight leading-tight">Your Knowledge Desk is Empty</h1>
                        <p className="text-black/40 max-w-md text-lg font-medium leading-relaxed">Upload up to 3 study notes on the home page to start specialized AI tutoring sessions.</p>
                        <Link href="/" className="mt-10 px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all">
                            Go to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
