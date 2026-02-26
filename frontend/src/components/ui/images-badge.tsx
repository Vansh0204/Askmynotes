"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  text?: string;
  images: string[];
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
export function ImagesBadge({
  text,
  images,
  className,
  coverImage = "/bookie.png",
  bookSize = { width: 400, height: 300 },
  teaserImageSize = { width: 100, height: 75 },
  hoverImageSize = { width: 400, height: 280 },
  hoverTranslateY = -320,
  hoverSpread = 160,
  hoverRotation = 15,
  onFileSelect,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const displayImages = images.slice(0, 3);

  const handleContainerClick = () => {
    if (onFileSelect) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex cursor-pointer flex-col items-center gap-6 group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
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
        {/* ===== CARDS that emerge from the center of the book ===== */}
        {displayImages.map((image, index) => {
          const totalImages = displayImages.length;

          // Rotation logic for fanning out
          const baseRotation =
            totalImages === 1
              ? 0
              : (index - (totalImages - 1) / 2) * hoverRotation;

          // Translation logic (fly up and out)
          const hoverY = hoverTranslateY - (totalImages - 1 - index) * 10;
          const hoverX = (index - (totalImages - 1) / 2) * hoverSpread;

          // Tease state (small peek in the middle of the book)
          const teaseY = -15 + index * 2;
          const teaseRotation = (index - (totalImages - 1) / 2) * 2;

          return (
            <motion.div
              key={index}
              className="absolute left-1/2 origin-bottom overflow-hidden bg-white"
              style={{
                top: "45%", // Start from the middle-ish of the open book
                zIndex: isHovered ? 20 + index : 5 + index,
                borderRadius: 12,
                boxShadow: isHovered
                  ? "0 20px 50px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.1)"
                  : "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
              animate={{
                x: `calc(-50% + ${isHovered ? hoverX : 0}px)`,
                y: isHovered ? hoverY : teaseY,
                rotate: isHovered ? baseRotation : teaseRotation,
                width: isHovered ? hoverImageSize.width : teaserImageSize.width,
                height: isHovered
                  ? hoverImageSize.height
                  : teaserImageSize.height,
                scale: isHovered ? 1 : 0.4,
                opacity: isHovered ? 1 : 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
                delay: index * 0.05,
              }}
            >
              {image.startsWith('http') || image.startsWith('/') ? (
                <img
                  src={image}
                  alt={`Note preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold p-4 text-center">
                  {image}
                </div>
              )}
              {/* Reflective overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </motion.div>
          );
        })}

        {/* ===== THE BOOK IMAGE (Static/Scaling Base) ===== */}
        <motion.div
          className="relative z-10 w-full h-full flex items-center justify-center p-4"
          animate={{
            scale: isHovered ? 1.05 : 1,
            rotateX: isHovered ? 5 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
        >
          <img
            src={coverImage}
            alt="Open Book Base"
            className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
          />
        </motion.div>

        {/* ===== Shadow/Glow underneath ===== */}
        <motion.div
          className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-[50%]"
          animate={{
            width: isHovered ? bookSize.width * 1.2 : bookSize.width * 0.8,
            opacity: isHovered ? 0.3 : 0.15,
            scale: isHovered ? 1.1 : 1,
          }}
          style={{
            height: 40,
            background: "radial-gradient(ellipse at center, #6366f1, transparent 70%)",
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />
      </div>

      {/* Text label */}
      {text && (
        <span
          className="text-2xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors"
          style={{ color: "#1a1825", fontFamily: "'DM Sans', sans-serif" }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
