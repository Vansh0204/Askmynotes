"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFile } from "@/context/FileContext";
import { SmoothCursor } from "@/components/ui/smooth-cursor"

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

import { Persona, type PersonaState } from "@/components/ai-elements/persona";

export default function VoicePage() {
    const { selectedFile } = useFile();
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Map internal states to Persona states
    const personaState: PersonaState = isRecording
        ? "listening"
        : isProcessing
            ? "thinking"
            : isSpeaking
                ? "speaking"
                : "idle";

    // Mock/Persisted context from FileContext (in a real app, this would come from a server-side session)
    const [extractedText] = useState("");
    const [subjectName, setSubjectName] = useState("Your Study Material");

    useEffect(() => {
        if (selectedFile) {
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

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsRecording(true);
            setTranscript("");
            window.speechSynthesis.cancel();
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
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <SmoothCursor />

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animae-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-20">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </div>
                </Link>
                <div className="text-right">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Professor AI // Interactive</p>
                    <p className="text-lg font-bold text-indigo-400 mt-1">{subjectName}</p>
                </div>
            </div>

            {/* Main Visualizer Container */}
            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-4xl text-center">

                <div className="relative group">
                    {/* Glowing Aura for Persona */}
                    <motion.div
                        className="absolute inset-0 blur-[60px] rounded-full z-0"
                        animate={{
                            backgroundColor: isRecording
                                ? ["rgba(239, 68, 68, 0.4)", "rgba(239, 68, 68, 0.2)"]
                                : isSpeaking
                                    ? ["rgba(99, 102, 241, 0.4)", "rgba(99, 102, 241, 0.2)"]
                                    : "rgba(99, 102, 241, 0.1)"
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* The Persona Element */}
                    <div className="relative z-10 bg-black/40 rounded-full p-8 backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        <Persona
                            variant="opal"
                            state={personaState}
                            className="size-[300px]"
                        />
                    </div>
                </div>

                {/* Subtitle / Status */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {isRecording ? (
                            <motion.div
                                key="listening"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <span className="text-red-400 text-xs font-black tracking-[0.5em] uppercase">Listening</span>
                                <p className="text-3xl font-medium tracking-tight text-white/90 italic">
                                    &ldquo;{transcript || "I'm listening..."}&rdquo;
                                </p>
                            </motion.div>
                        ) : isProcessing ? (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                                <span className="text-indigo-400 text-xs font-black tracking-[0.5em] uppercase">Thinking</span>
                            </motion.div>
                        ) : aiResponse ? (
                            <motion.div
                                key="speaking"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-xl mx-auto"
                            >
                                <p className="text-2xl font-bold leading-tight text-indigo-100 mb-6 drop-shadow-sm">
                                    {aiResponse}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-xs font-black tracking-[1em] uppercase">Ready to talk</span>
                                <p className="text-lg font-medium tracking-widest uppercase opacity-40">Tap the mic and say hello</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Interaction Button */}
                <div className="mt-8">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                            "group relative flex items-center justify-center transition-all duration-700",
                            isRecording ? "scale-110" : "hover:scale-105 active:scale-95"
                        )}
                    >
                        {/* Ring background */}
                        <div className={cn(
                            "absolute inset-[-12px] rounded-full blur-xl transition-all duration-700",
                            isRecording ? "bg-red-500/40" : "bg-indigo-500/20 group-hover:bg-indigo-500/40"
                        )} />

                        {/* Main Button Body */}
                        <div className={cn(
                            "relative w-24 h-24 rounded-full flex items-center justify-center border transition-all duration-700",
                            isRecording
                                ? "bg-red-500 border-red-400 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                                : "bg-black/80 border-white/10 text-white hover:border-indigo-400/50"
                        )}>
                            {isRecording ? (
                                <div className="w-8 h-8 bg-white rounded-lg animate-pulse" />
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:text-indigo-400 transition-colors">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            )}
                        </div>
                    </button>

                    {!isRecording && aiResponse && (
                        <div className="absolute top-[calc(100%+2rem)] left-1/2 -translate-x-1/2">
                            <button
                                onClick={() => speak(aiResponse)}
                                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                                Replay Voice
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hint Footer */}
            <div className="absolute bottom-12 z-20 opacity-20 hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-indigo-400">Interaction Tip</span>
                <p className="text-[10px] font-medium tracking-widest">ASK ANYTHING ABOUT YOUR NOTES IN PLAIN ENGLISH</p>
            </div>
        </div>
    );
}
