"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFile } from "@/context/FileContext";
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

export default function VoicePage() {
    const { selectedFile } = useFile();
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Mock/Persisted context from FileContext (in a real app, this would come from a server-side session)
    const [extractedText] = useState("");
    const [subjectName, setSubjectName] = useState("Your Study Material");

    useEffect(() => {
        // In a real flow, the user would have uploaded a file. 
        // For the demo, we'll try to get it from context or show a placeholder.
        if (selectedFile) {
            // We'd ideally have the text already analyzed, but for now we'll assume it exists
            setSubjectName(selectedFile.name);
        }
    }, [selectedFile]);

    const handleSend = async (question: string) => {
        if (!question.trim()) return;
        setIsProcessing(true);
        setAiResponse("");

        try {
            const response = await fetch("http://localhost:5003/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject_name: subjectName,
                    extracted_text: extractedText || "This is a placeholder context for the voice teacher interaction.",
                    question: question,
                    history: [],
                }),
            });

            if (!response.ok) throw new Error("Chat failed");

            const result = await response.json();
            setAiResponse(result.answer);
            speak(result.answer);
        } catch {
            const errMsg = "I'm sorry, I'm having trouble connecting to my knowledge base.";
            setAiResponse(errMsg);
            speak(errMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const speak = (text: string) => {
        const cleanText = text.replace(/\[.*?\]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.cancel(); // Stop any current speech
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsRecording(true);
            setTranscript("");
            window.speechSynthesis.cancel(); // Stop AI if user starts speaking
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = Array.from(Object.values(event.results))
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join("");
            setTranscript(currentTranscript);
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (transcript.trim()) {
                handleSend(transcript);
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#1a1825] flex flex-col items-center justify-center p-8 overflow-hidden relative">
            {/* Background Doodles and Shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
                <div className="absolute top-20 left-10 rotate-12"><DoodleNotebook color={COLORS.blue} /></div>
                <div className="absolute bottom-20 left-40 -rotate-12"><DoodleStar color={COLORS.yellow} /></div>
                <div className="absolute top-1/2 right-20 rotate-45"><DoodlePaperPlane color={COLORS.pink} /></div>
                <div className="absolute top-40 right-1/4 -rotate-12"><DoodleLightbulb color={COLORS.purple} /></div>
                <div className="absolute bottom-10 right-10 rotate-12"><DoodlePencil color={COLORS.red} /></div>
            </div>
            {/* Header */}
            <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-20">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-bold text-xs tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">Return Home</span>
                </Link>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest uppercase opacity-20">Voice Mode // Active</p>
                    <p className="text-sm font-black text-indigo-600">{subjectName}</p>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-16">
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Pulsing Circles */}
                    <AnimatePresence>
                        {isSpeaking && (
                            <>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 0.15 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 0.25 }}
                                    exit={{ scale: 1.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                    className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Core Orb */}
                    <motion.div
                        animate={{
                            scale: isRecording ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
                            boxShadow: isRecording
                                ? "0 0 60px rgba(239, 68, 68, 0.2)"
                                : isSpeaking
                                    ? "0 0 60px rgba(99, 102, 241, 0.2)"
                                    : "0 0 20px rgba(0,0,0,0.02)"
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={cn(
                            "w-56 h-56 rounded-[3rem] border-2 flex items-center justify-center transition-colors duration-500 bg-white shadow-2xl relative z-10",
                            isRecording ? "border-red-500/20" : isSpeaking ? "border-indigo-500/20" : "border-black/5"
                        )}
                    >
                        {isRecording ? (
                            <div className="flex gap-2 items-center">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 bg-red-500 rounded-full"
                                        animate={{ height: [20, 60, 20] }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : isSpeaking ? (
                            <div className="flex gap-2 items-center">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 bg-indigo-500 rounded-full"
                                        animate={{ height: [15, 50, 15] }}
                                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="w-4 h-4 bg-black/5 rounded-full" />
                        )}
                    </motion.div>
                </div>

                {/* Text Display */}
                <div className="text-center max-w-2xl px-4 min-h-[120px] flex flex-col items-center justify-center gap-4">
                    <AnimatePresence mode="wait">
                        {isRecording ? (
                            <motion.div
                                key="recording"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                <p className="text-red-500 font-black tracking-[0.3em] text-[10px] uppercase animate-pulse">Capturing Voice...</p>
                                <p className="text-4xl font-extrabold tracking-tight leading-tight italic opacity-90 text-[#1a1825]">
                                    {transcript || "Speak clearly..."}
                                </p>
                            </motion.div>
                        ) : isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="flex gap-2 text-indigo-600">
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
                                </div>
                                <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Consulting Professor AI</p>
                            </motion.div>
                        ) : aiResponse ? (
                            <motion.div
                                key="response"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-3xl font-extrabold tracking-tight leading-snug max-w-3xl text-gradient">
                                    {aiResponse}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                className="text-2xl font-black tracking-tight"
                            >
                                TAP TO SPEAK
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-10 mt-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                            "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 group relative shadow-2xl overflow-hidden",
                            isRecording
                                ? "bg-red-500 text-white scale-110 shadow-red-500/30"
                                : "bg-black text-white hover:scale-110 shadow-black/20"
                        )}
                    >
                        {isRecording ? (
                            <div className="w-10 h-10 bg-white rounded-2xl" />
                        ) : (
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {!isRecording && aiResponse && (
                        <button
                            onClick={() => speak(aiResponse)}
                            className="w-18 h-18 py-6 px-6 rounded-full bg-white border border-black/5 flex items-center justify-center text-black/40 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110 shadow-xl transition-all"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <path d="M15.53 8.47a5 5 0 0 1 0 7.07" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Tip */}
            <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-indigo-600">Teacher Guidance System</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1825]">Ask for examples, comparisons, or simplifications</span>
            </div>
        </div>
    );
}
