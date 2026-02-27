"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { createPortal } from "react-dom";
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
  /** Optional array of image URLs to display */
  images?: string[];
}

/**
 * ImagesBadge - A component that displays a 3D book image and fans out images on hover.
 */
interface SlotState {
  file: File | null;
  subject: string;
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
  images = [],
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");
  const [slots, setSlots] = useState<SlotState[]>([
    { file: null, subject: "", isAnalyzing: false, citations: [] },
    { file: null, subject: "", isAnalyzing: false, citations: [] },
    { file: null, subject: "", isAnalyzing: false, citations: [] },
  ]);
  const activeSlotRef = React.useRef<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSlotClick = (index: number) => {
    activeSlotRef.current = index;
    // Pre-fill subject name if it's an update, but usually slots[index].file check is done in render
    if (slots[index].subject) {
      setSubjectName(slots[index].subject);
    }
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
        const response = await fetch(`${apiUrl}/api/upload/notes`, {
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
            subject: subjectName,
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
    <>
      {isMounted && createPortal(
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="note-form-portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-[0_32px_64px_rgba(0,0,0,0.2)] border border-black/5 flex flex-col items-center text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 transform rotate-3 shadow-xl">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                <h3 className="text-3xl font-bold text-[#1a1825] mb-2" style={{ fontFamily: "'DotGothic16', sans-serif" }}>
                  Label your Note
                </h3>
                <p className="text-sm text-black/40 mb-8 font-medium italic">Give your study material a name and context</p>

                <div className="space-y-4 w-full">
                  <input
                    autoFocus
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Subject Name (e.g. History)"
                    className="w-full bg-[#f8f9ff] border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-[#1a1825] placeholder:text-black/20 font-bold"
                  />
                  <textarea
                    value={subjectDesc}
                    onChange={(e) => setSubjectDesc(e.target.value)}
                    placeholder="Brief description (optional)..."
                    className="w-full bg-[#f8f9ff] border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-indigo-600 focus:bg-white transition-all text-[#1a1825] placeholder:text-black/20 font-bold resize-none h-32"
                  />
                </div>

                <button
                  onClick={onConfirmUpload}
                  className="w-full mt-8 py-5 rounded-2xl bg-[#1a1825] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
                >
                  Confirm & Select PDF
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-black/20 hover:text-red-500 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
                  {images[index] && (
                    <div
                      className="absolute inset-0 z-0 bg-cover bg-center opacity-40 group-hover/slot:opacity-60 transition-opacity"
                      style={{ backgroundImage: `url(${images[index]})` }}
                    />
                  )}
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center">
                    {slot.file ? (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-20 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-indigo-900 truncate max-w-[200px]">{slot.subject || slot.file?.name}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{slot.subject ? "Subject Active" : "Note Active"}</p>
                          {slot.subject && <p className="text-[8px] text-black/20 mt-1 truncate max-w-[150px]">Latest: {slot.file?.name}</p>}
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
    </>
  );
}
