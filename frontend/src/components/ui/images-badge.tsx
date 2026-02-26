"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  text?: string;
  images: string[];
  className?: string;
  /** Book cover image path */
  coverImage?: string;
  /** Book dimensions { width, height } in pixels */
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
}

export function ImagesBadge({
  text,
  images,
  className,
  coverImage,
  bookSize = { width: 320, height: 240 },
  teaserImageSize = { width: 120, height: 86 },
  hoverImageSize = { width: 420, height: 300 },
  hoverTranslateY = -330,
  hoverSpread = 140,
  hoverRotation = 12,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayImages = images.slice(0, 3);

  const spineWidth = 18;
  const coverRadius = 8;

  return (
    <div
      className={cn(
        "inline-flex cursor-pointer flex-col items-center gap-5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book — top-down laying flat view */}
      <div
        className="relative"
        style={{
          width: bookSize.width,
          height: bookSize.height,
          perspective: "1400px",
        }}
      >
        {/* ===== BACK COVER ===== */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: `${coverRadius}px ${coverRadius + 3}px ${coverRadius + 3}px ${coverRadius}px`,
            background: "linear-gradient(145deg, #3730a3 0%, #4c1d95 50%, #3b0764 100%)",
            boxShadow: `
              0 12px 48px rgba(67, 56, 202, 0.3),
              0 4px 16px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
          }}
        />

        {/* ===== SPINE ===== */}
        <div
          className="absolute top-0 left-0 z-[5]"
          style={{
            width: spineWidth,
            height: bookSize.height,
            borderRadius: `${coverRadius}px 0 0 ${coverRadius}px`,
            background: "linear-gradient(180deg, #312e81, #1e1b4b)",
            boxShadow: "inset -3px 0 8px rgba(0,0,0,0.35), 3px 0 6px rgba(0,0,0,0.15)",
          }}
        >
          {/* Spine ridges */}
          {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: `${pos * 100}%`,
                width: 8,
                height: 2,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>

        {/* ===== PAGES ===== */}
        <div
          className="absolute z-[3]"
          style={{
            top: 5,
            left: spineWidth + 3,
            right: 5,
            bottom: 5,
            borderRadius: `0 ${coverRadius - 1}px ${coverRadius - 1}px 0`,
            background: `
              linear-gradient(180deg,
                #faf7f2 0%, #f5f0e8 20%, #faf7f2 40%, #f5f0e8 60%,
                #faf7f2 80%, #f0ebe2 100%
              )
            `,
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.04), 1px 0 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Page lines */}
          {[0.18, 0.3, 0.42, 0.54, 0.66, 0.78].map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${pos * 100}%`,
                left: "14%",
                right: "8%",
                height: 1.5,
                background: `rgba(99, 102, 241, ${0.05 + i * 0.005})`,
                borderRadius: 1,
              }}
            />
          ))}
          {/* Red margin */}
          <div
            className="absolute"
            style={{
              top: "6%",
              bottom: "6%",
              left: "12%",
              width: 1.5,
              background: "rgba(239, 68, 68, 0.1)",
            }}
          />
        </div>

        {/* ===== CARDS that pop out ===== */}
        {displayImages.map((image, index) => {
          const totalImages = displayImages.length;

          const baseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverRotation
                : (index - 1) * hoverRotation;

          const hoverY = hoverTranslateY - (totalImages - 1 - index) * 6;
          const hoverX =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverSpread
                : (index - 1) * hoverSpread;

          const teaseY = -8 - (totalImages - 1 - index) * 3;
          const teaseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * 3
                : (index - 1) * 3;

          return (
            <motion.div
              key={index}
              className="absolute left-1/2 origin-bottom overflow-hidden bg-white"
              style={{
                top: 6,
                zIndex: 15 + index,
                borderRadius: 10,
                boxShadow: isHovered
                  ? "0 16px 50px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.12)"
                  : "0 3px 10px rgba(0,0,0,0.1)",
              }}
              animate={{
                x: `calc(-50% + ${isHovered ? hoverX : 0}px)`,
                y: isHovered ? hoverY : teaseY,
                rotate: isHovered ? baseRotation : teaseRotation,
                width: isHovered ? hoverImageSize.width : teaserImageSize.width,
                height: isHovered
                  ? hoverImageSize.height
                  : teaserImageSize.height,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 22,
                delay: index * 0.05,
              }}
            >
              {/* Doodly inner border */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  border: "3px solid rgba(99, 102, 241, 0.06)",
                  borderRadius: 10,
                }}
              />
              <img
                src={image}
                alt={`Note preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}

        {/* ===== FRONT COVER (swings open on hover) ===== */}
        <motion.div
          className="absolute z-20 overflow-hidden"
          style={{
            top: 0,
            left: spineWidth,
            right: 0,
            bottom: 0,
            borderRadius: `0 ${coverRadius + 3}px ${coverRadius + 3}px 0`,
            transformOrigin: "left center",
            boxShadow: isHovered
              ? "0 24px 70px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 6px 24px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
          animate={{
            rotateY: isHovered ? -75 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 25,
          }}
        >
          {/* Cover image or gradient fallback */}
          {coverImage ? (
            <img
              src={coverImage}
              alt="Book cover"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                borderRadius: `0 ${coverRadius + 3}px ${coverRadius + 3}px 0`,
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(145deg,
                    #6366f1 0%,
                    #7c3aed 35%,
                    #8b5cf6 65%,
                    #7c3aed 100%
                  )
                `,
              }}
            />
          )}

          {/* Subtle gradient overlay for depth on image */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: `0 ${coverRadius + 3}px ${coverRadius + 3}px 0`,
              background: "linear-gradient(135deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />

          {/* Corner accents */}
          {[
            { top: 12, right: 12 },
            { bottom: 12, right: 12 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                ...pos,
                width: 14,
                height: 14,
                borderTop: i === 0 ? "2px solid rgba(255,255,255,0.2)" : "none",
                borderBottom: i === 1 ? "2px solid rgba(255,255,255,0.2)" : "none",
                borderRight: "2px solid rgba(255,255,255,0.2)",
              } as React.CSSProperties}
            />
          ))}
        </motion.div>

        {/* ===== Hover glow ===== */}
        <motion.div
          className="pointer-events-none absolute -inset-12 rounded-3xl"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12), transparent 70%)",
            filter: "blur(25px)",
            zIndex: 0,
          }}
        />
      </div>

      {/* Text label */}
      {text && (
        <span
          className="text-xl font-semibold"
          style={{ color: "#2d2b3d", fontFamily: "'DM Sans', sans-serif" }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
