"use client";

import React, { useState, useEffect } from "react";
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
import { SmoothCursor } from "@/components/ui/smooth-cursor"

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
    topics: { topic_name: string }[];
}

interface PracticeResult {
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

export default function StudyPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [practiceData, setPracticeData] = useState<PracticeResult | null>(null);
    const [revealedMcqs, setRevealedMcqs] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch("http://localhost:5003/api/chat/sessions");
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data);
                }
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            }
        };
        fetchSessions();
    }, []);

    const generateQuestions = async () => {
        if (!selectedSession) return;
        setIsLoading(true);
        setPracticeData(null);
        setRevealedMcqs({});

        try {
            const response = await fetch("http://localhost:5003/api/study/practice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_name: selectedSession.subject,
                    topic: selectedTopic || undefined,
                    extracted_text: selectedSession.extracted_text,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setPracticeData(result);
            }
        } catch (err) {
            console.error("Failed to generate questions", err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderText = (text: string) => {
        if (!text) return "";
        const parts = text.split(/(<u>.*?<\/u>)/g);
        return parts.map((part, i) => {
            if (part.startsWith("<u>") && part.endsWith("</u>")) {
                return <u key={i} className="decoration-indigo-500/50 underline-offset-2">{part.slice(3, -4)}</u>;
            }
            return part;
        });
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#1a1825] pb-20 relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <SmoothCursor />

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[150px]" />
            </div>

            {/* Background Doodles and Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
                <div className="absolute top-40 left-10 rotate-12"><DoodleNotebook color={COLORS.blue} /></div>
                <div className="absolute bottom-20 left-40 -rotate-12"><DoodleStar color={COLORS.yellow} /></div>
                <div className="absolute top-1/2 right-20 rotate-45"><DoodlePaperPlane color={COLORS.pink} /></div>
                <div className="absolute top-[15%] right-1/4 -rotate-12"><DoodleLightbulb color={COLORS.purple} /></div>
                <div className="absolute bottom-10 right-10 rotate-12"><DoodlePencil color={COLORS.red} /></div>
            </div>

            {/* Header */}
            <header className="h-20 bg-white/70 border-b border-black/5 flex items-center justify-between px-10 sticky top-0 z-50 backdrop-blur-xl transition-all">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white font-bold group-hover:bg-indigo-600 transition-colors shadow-lg shadow-black/10">
                            <span style={{ fontFamily: "'DotGothic16', sans-serif" }}>A</span>
                        </div>
                    </Link>
                    <div className="h-6 w-[1px] bg-black/10" />
                    <div className="flex flex-col">
                        <h1 className="font-extrabold text-sm tracking-tight leading-none text-[#1a1825]">STUDY ROOM</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1 opacity-60">Session Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/chat" className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-indigo-600 hover:opacity-100 transition-all flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
                        Back to Chat
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-12 px-6">
                {/* Selection Area */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-3 ml-1">1. Choose Subject</label>
                            <div className="space-y-2">
                                {sessions.length === 0 ? (
                                    <p className="text-xs text-black/40 italic p-4 bg-black/5 rounded-2xl">No notes uploaded yet. Go to Home to upload.</p>
                                ) : (
                                    sessions.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedSession(s);
                                                setSelectedTopic("");
                                            }}
                                            className={cn(
                                                "p-4 rounded-2xl cursor-pointer border transition-all",
                                                selectedSession?.id === s.id
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20"
                                                    : "bg-white border-black/5 hover:border-black/10"
                                            )}
                                        >
                                            <p className="font-bold text-sm">{s.subject}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-3 ml-1">2. Focus Topic (Optional)</label>
                            <select
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                disabled={!selectedSession}
                                className="w-full bg-white border border-black/5 p-4 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 disabled:opacity-30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Full Context</option>
                                {selectedSession?.topics.map((t, i) => (
                                    <option key={i} value={t.topic_name}>{t.topic_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={generateQuestions}
                        disabled={!selectedSession || isLoading}
                        className="w-full mt-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-xl shadow-black/10"
                    >
                        {isLoading ? "Generating Assessment..." : "Begin Practice Session"}
                    </button>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                        />
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-600 animate-pulse">AI is crafting questions from your notes...</p>
                    </div>
                )}

                {/* Questions Display */}
                {practiceData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-16"
                    >
                        {/* Section 1: MCQs */}
                        <div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Section 01</div>
                                <h2 className="text-2xl font-extrabold tracking-tight">Multiple Choice Analysis</h2>
                            </div>

                            <div className="space-y-10">
                                {practiceData.mcqs.map((q, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8">
                                            <span className="text-[10px] font-black text-black/10">Q{idx + 1}</span>
                                        </div>
                                        <p className="text-xl font-bold mb-8 pr-12 leading-relaxed">{renderText(q.question)}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => setRevealedMcqs(prev => ({ ...prev, [idx]: true }))}
                                                    className={cn(
                                                        "p-5 rounded-2xl text-left text-sm font-medium transition-all group border",
                                                        revealedMcqs[idx] && oIdx === q.correct_option_index
                                                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                                                            : revealedMcqs[idx]
                                                                ? "bg-black/5 border-transparent text-black/30"
                                                                : "bg-white border-black/5 hover:border-black/20 hover:bg-black/5"
                                                    )}
                                                >
                                                    <span className="inline-block w-8 font-black opacity-20 group-hover:opacity-40 transition-opacity">{String.fromCharCode(65 + oIdx)}</span>
                                                    {renderText(opt)}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {revealedMcqs[idx] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    className="mt-10 pt-10 border-t border-black/5"
                                                >
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Correct Answer</span>
                                                        <span className="text-xs font-bold text-black/40 tracking-tight">Confidence: {(q.confidence * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-black/70 leading-relaxed mb-6">{renderText(q.explanation)}</p>

                                                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Note Reference</p>
                                                        <p className="text-xs italic text-indigo-900/60 leading-relaxed">&ldquo;{q.citation}&rdquo;</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Short Answer */}
                        <div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="px-4 py-1.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Section 02</div>
                                <h2 className="text-2xl font-extrabold tracking-tight">Descriptive Concepts</h2>
                            </div>

                            <div className="space-y-10">
                                {practiceData.short_answers.map((q, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm">
                                        <p className="text-xl font-bold mb-8 leading-relaxed underline decoration-purple-500/20 underline-offset-8">{renderText(q.question)}</p>

                                        <div className="space-y-8">
                                            <div className="relative pl-6 border-l-4 border-purple-500/30">
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2">Model Answer</p>
                                                <p className="text-sm font-medium leading-relaxed text-black/80">{renderText(q.model_answer)}</p>
                                            </div>

                                            <div className="bg-[#f8f9fb] p-8 rounded-3xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Reasoning & Verification</p>
                                                    <span className="text-[10px] font-bold text-black/20">{(q.confidence * 100).toFixed(0)}% Confidence Match</span>
                                                </div>
                                                <p className="text-xs font-medium text-black/60 leading-relaxed">{renderText(q.explanation)}</p>

                                                <div className="pt-4 border-t border-black/5 flex items-start gap-4">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-black/10 mt-1 shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                    <p className="text-[11px] italic text-black/40 leading-relaxed pr-8">&ldquo;{q.citation}&rdquo;</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
