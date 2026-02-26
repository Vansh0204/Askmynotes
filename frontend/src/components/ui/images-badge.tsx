"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  text?: string;
  className?: string;
  /** Book image path (e.g., bookie.png) */
  coverImage?: string;
  /** Container dimensions { width, height } in pixels */
  bookSize?: { width: number; height: number };
  /** Image dimensions when teased (peeking) */
  teaserImageSize?: { width: number; height: number };
  /** Image dimensions when hovered */
  hoverImageSize?: { width: number; height: number };
  /** How far images translate up on hover */
  hoverTranslateY?: number;
  /** How far images spread horizontally on hover */
  hoverSpread?: number;
  /** Rotation angle for fanned images on hover */
  hoverRotation?: number;
  /** Optional callback when a file is selected */
  onFileSelect?: (file: File) => void;
}

/**
 * ImagesBadge - A component that displays a 3D book image and fans out images on hover.
 * Optimized for "bookie.png" which is an open-book image.
 */
interface SlotState {
  file: File | null;
  isAnalyzing: boolean;
  citations: string[];
}

export function ImagesBadge({
  text,
  className,
  coverImage = "/bookie.png",
  bookSize = { width: 450, height: 320 },
  teaserImageSize = { width: 140, height: 100 },
  hoverImageSize = { width: 450, height: 320 },
  hoverTranslateY = -350,
  hoverSpread = 200,
  hoverRotation = 20,
  onFileSelect,
}: Omit<ImagesBadgeProps, 'images'>) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [slots, setSlots] = useState<SlotState[]>([
    { file: null, isAnalyzing: false, citations: [] },
    { file: null, isAnalyzing: false, citations: [] },
    { file: null, isAnalyzing: false, citations: [] },
  ]);
  const activeSlotRef = React.useRef<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSlotClick = (index: number) => {
    if (slots[index].file) return; // Note already exists
    activeSlotRef.current = index;
    setShowForm(true);
  };

  const onConfirmUpload = () => {
    if (!subjectName.trim()) {
      alert("Please enter a subject name");
      return;
    }
    setShowForm(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = activeSlotRef.current;
    if (file && index !== null) {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], file, isAnalyzing: true };
      setSlots(newSlots);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject_name", subjectName);
      formData.append("optional_description", subjectDesc);

      try {
        const response = await fetch("http://localhost:5003/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          const citations: string[] = [
            ...(result.topics?.map((t: { citations?: string[] }) => t.citations?.[0]).filter(Boolean) || []),
            ...(result.key_concepts?.map((c: { citation: string }) => c.citation).filter(Boolean) || []),
          ].slice(0, 5) as string[];

          newSlots[index] = {
            ...newSlots[index],
            isAnalyzing: false,
            citations,
          };
          setSlots([...newSlots]);

          if (onFileSelect) onFileSelect(file);
          // Reset form
          setSubjectName("");
          setSubjectDesc("");
        } else {
          const err = await response.json();
          alert(err.error || "Upload failed");
          newSlots[index] = { ...newSlots[index], file: null, isAnalyzing: false };
          setSlots([...newSlots]);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Network error: Could not reach the server. Please ensure the backend is running on port 5003.");
        newSlots[index] = { ...newSlots[index], file: null, isAnalyzing: false };
        setSlots([...newSlots]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={cn(
        "inline-flex cursor-pointer flex-col items-center gap-10 group relative",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredSlot(null);
      }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-2">Note Details</h3>
              <p className="text-sm text-indigo-400 mb-6 font-medium uppercase tracking-tight">Step 1: Enter subject context</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1.5 ml-1">Subject Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. History of Rome"
                    className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors text-indigo-900 placeholder:text-indigo-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-black/40 mb-1.5 ml-1">Optional Description</label>
                  <textarea
                    value={subjectDesc}
                    onChange={(e) => setSubjectDesc(e.target.value)}
                    placeholder="Briefly describe what this note covers..."
                    className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors text-indigo-900 placeholder:text-indigo-300 font-medium resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3.5 rounded-xl text-black font-bold text-sm bg-black/5 hover:bg-black/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmUpload}
                  className="flex-[2] py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                >
                  Confirm & Upload PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.txt"
      />
      <div
        className="relative"
        style={{
          width: bookSize.width,
          height: bookSize.height,
          perspective: "1200px",
        }}
      >
        {/* ===== THE 3 INTERACTIVE SLOTS ===== */}
        {slots.map((slot, index) => {
          const totalSlots = slots.length;
          const isThisSlotHovered = hoveredSlot === index;
          const baseRotation = (index - (totalSlots - 1) / 2) * hoverRotation;
          const hoverY = hoverTranslateY - (totalSlots - 1 - index) * 15;
          const hoverX = (index - (totalSlots - 1) / 2) * hoverSpread;

          const teaseY = -20 + index * 4;
          const teaseRotation = (index - (totalSlots - 1) / 2) * 3;

          return (
            <motion.div
              key={index}
              className="absolute left-1/2 origin-bottom overflow-hidden bg-white group/slot shadow-xl"
              style={{
                top: "40%",
                zIndex: isThisSlotHovered ? 100 : (isHovered ? 20 + index : 5 + index),
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.05)",
              }}
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              animate={{
                x: `calc(-50% + ${isHovered ? hoverX : 0}px)`,
                y: isThisSlotHovered ? hoverY - 40 : (isHovered ? hoverY : teaseY),
                rotate: isThisSlotHovered ? 0 : (isHovered ? baseRotation : teaseRotation),
                width: isHovered ? hoverImageSize.width : teaserImageSize.width,
                height: isHovered ? hoverImageSize.height : teaserImageSize.height,
                scale: isThisSlotHovered ? 1.3 : (isHovered ? 1.1 : 0.5),
                opacity: isHovered ? 1 : 0.7,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 24,
                delay: index * 0.08,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSlotClick(index);
              }}
            >
              {/* Slot Content */}
              <div className="relative h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50/50 to-white overflow-hidden">
                {slot.file ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-20 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-indigo-900 truncate max-w-[200px]">{slot.file.name}</p>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Note Uploaded</p>
                    </div>

                    {/* Citations Animation */}
                    <AnimatePresence>
                      {slot.citations.map((cite, cIdx) => (
                        <motion.div
                          key={`${index}-${cIdx}`}
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 1, 0.8],
                            x: (Math.random() - 0.5) * 300,
                            y: -100 - Math.random() * 200,
                          }}
                          transition={{
                            duration: 4,
                            delay: cIdx * 0.5,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="absolute pointer-events-none bg-white p-3 rounded-xl border border-indigo-100 shadow-2xl text-[10px] font-medium text-indigo-700 max-w-[150px] leading-tight z-50 text-left"
                        >
                          <span className="block mb-1 text-red-500 font-bold tracking-widest text-[8px]">CITATION</span>
                          &ldquo;{cite.length > 60 ? cite.substring(0, 60) + "..." : cite}&rdquo;
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 group-hover/slot:scale-110 transition-transform">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center text-indigo-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Get PDF / TXT</p>
                  </div>
                )}

                {/* Analyzing Overlay */}
                {slot.isAnalyzing && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-8 text-center z-30">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full mb-4"
                    />
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">AI Reading Note...</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ===== THE BOOK IMAGE (Static/Scaling Base) ===== */}
        <motion.div
          className="relative z-10 w-full h-full flex items-center justify-center p-4 h-[120%]"
          animate={{
            scale: isHovered ? 1.15 : 1,
            rotateX: isHovered ? 10 : 0,
            y: isHovered ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 20,
          }}
        >
          <Image
            src={coverImage}
            alt="Open Book Base"
            fill
            priority
            className="object-contain pointer-events-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
          />
        </motion.div>

        {/* ===== Shadow/Glow underneath ===== */}
        <motion.div
          className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-[50%]"
          animate={{
            width: isHovered ? bookSize.width * 1.5 : bookSize.width * 0.9,
            opacity: isHovered ? 0.4 : 0.15,
            scale: isHovered ? 1.2 : 1,
          }}
          style={{
            height: 60,
            background: "radial-gradient(ellipse at center, #6366f1, transparent 70%)",
            filter: "blur(30px)",
            zIndex: 0,
          }}
        />
      </div>

      {/* Text label */}
      {text && (
        <motion.span
          className="text-4xl font-extrabold tracking-tight transition-colors mb-4"
          animate={{
            y: isHovered ? 20 : 0,
            color: isHovered ? "#6366f1" : "#1a1825",
            scale: isHovered ? 1.1 : 1,
          }}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
