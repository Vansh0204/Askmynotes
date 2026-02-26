"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFile } from "@/context/FileContext";

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
            const response = await fetch("http://localhost:5001/api/chat", {
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
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 overflow-hidden font-['DM_Sans']">
            {/* Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-20">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <span className="font-bold text-sm tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">Return Home</span>
                </Link>
                <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-20">Voice Mode // Active</p>
                    <p className="text-sm font-medium text-indigo-400">{subjectName}</p>
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
                                    animate={{ scale: 1.5, opacity: 0.3 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 0.5 }}
                                    exit={{ scale: 1.8, opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                    className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Core Orb */}
                    <motion.div
                        animate={{
                            scale: isRecording ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
                            boxShadow: isRecording
                                ? "0 0 60px rgba(239, 68, 68, 0.4)"
                                : isSpeaking
                                    ? "0 0 60px rgba(99, 102, 241, 0.4)"
                                    : "0 0 20px rgba(255,255,255,0.05)"
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={cn(
                            "w-48 h-48 rounded-full border-2 flex items-center justify-center transition-colors duration-500 bg-black/40 backdrop-blur-2xl relative z-10",
                            isRecording ? "border-red-500/50" : isSpeaking ? "border-indigo-500/50" : "border-white/10"
                        )}
                    >
                        {isRecording ? (
                            <div className="flex gap-1.5 items-center">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 bg-red-500 rounded-full"
                                        animate={{ height: [15, 45, 15] }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : isSpeaking ? (
                            <div className="flex gap-1.5 items-center">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 bg-indigo-500 rounded-full"
                                        animate={{ height: [10, 35, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="w-3 h-3 bg-white/20 rounded-full" />
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
                                <p className="text-red-500 font-bold tracking-widest text-xs uppercase animate-pulse">Listening...</p>
                                <p className="text-2xl font-medium tracking-tight overflow-hidden leading-relaxed italic opacity-80">
                                    {transcript || "Speak freely..."}
                                </p>
                            </motion.div>
                        ) : isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="flex gap-2 text-indigo-400">
                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                                </div>
                                <p className="text-xs uppercase font-bold tracking-[0.3em] opacity-30">Consulting Notes</p>
                            </motion.div>
                        ) : aiResponse ? (
                            <motion.div
                                key="response"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-2xl font-light tracking-tight leading-relaxed max-w-3xl">
                                    {aiResponse}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                className="text-2xl font-light tracking-tight"
                            >
                                Tap the button to start the conversation
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8 mt-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 group relative",
                            isRecording
                                ? "bg-red-600 scale-110 shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                                : "bg-white text-black hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                        )}
                    >
                        {isRecording ? (
                            <div className="w-8 h-8 bg-white rounded-lg" />
                        ) : (
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </button>

                    {!isRecording && aiResponse && (
                        <button
                            onClick={() => speak(aiResponse)}
                            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:scale-110 transition-all"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <path d="M15.53 8.47a5 5 0 0 1 0 7.07" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer Tip */}
            <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Teacher Guidance System</span>
                <span className="text-[10px] font-medium tracking-widest uppercase">Ask for examples, comparisons, or simplifications</span>
            </div>
        </div>
    );
}
