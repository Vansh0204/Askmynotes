"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  text: string;
  images: string[];
  className?: string;
  /** Optional link URL */
  href?: string;
  /** Link target attribute (e.g., "_blank" for new tab) */
  target?: string;
  /** Book dimensions { width, height } in pixels */
  bookSize?: { width: number; height: number };
  /** Image dimensions when teased (peeking) { width, height } in pixels */
  teaserImageSize?: { width: number; height: number };
  /** Image dimensions when hovered { width, height } in pixels */
  hoverImageSize?: { width: number; height: number };
  /** How far images translate up on hover in pixels */
  hoverTranslateY?: number;
  /** How far images spread horizontally on hover in pixels */
  hoverSpread?: number;
  /** Rotation angle for fanned images on hover in degrees */
  hoverRotation?: number;
}

export function ImagesBadge({
  text,
  images,
  className,
  href,
  target,
  bookSize = { width: 48, height: 56 },
  teaserImageSize = { width: 28, height: 20 },
  hoverImageSize = { width: 140, height: 108 },
  hoverTranslateY = -110,
  hoverSpread = 50,
  hoverRotation = 15,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Limit to max 3 images
  const displayImages = images.slice(0, 3);

  const Component = href ? "a" : "div";

  // Book proportions
  const spineWidth = bookSize.width * 0.12;
  const pageInset = bookSize.width * 0.08;

  return (
    <Component
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 perspective-[1000px] transform-3d",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book Container */}
      <motion.div
        className="relative"
        style={{
          width: bookSize.width,
          height: bookSize.height,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Book Back Cover */}
        <div
          className="absolute inset-0 rounded-r-[3px] rounded-l-[1px]"
          style={{
            background: "linear-gradient(135deg, #4338ca, #6d28d9)",
            boxShadow: "0 2px 8px rgba(67, 56, 202, 0.3)",
          }}
        />

        {/* Book Spine */}
        <div
          className="absolute top-0 left-0 rounded-l-[2px]"
          style={{
            width: spineWidth,
            height: bookSize.height,
            background: "linear-gradient(180deg, #3730a3, #4c1d95)",
            boxShadow: "inset -1px 0 2px rgba(0,0,0,0.2)",
          }}
        />

        {/* Book Pages (visible between covers) */}
        <div
          className="absolute"
          style={{
            top: 2,
            left: spineWidth + 1,
            right: 2,
            bottom: 2,
            background: "linear-gradient(90deg, #f5f0e8, #faf7f2, #f5f0e8)",
            borderRadius: "0 2px 2px 0",
            boxShadow: "inset 0 0 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Page lines */}
          {[0.25, 0.45, 0.65].map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${pos * 100}%`,
                left: pageInset,
                right: pageInset,
                height: 1,
                background: "rgba(0,0,0,0.06)",
              }}
            />
          ))}
        </div>

        {/* Images that pop out from the book */}
        {displayImages.map((image, index) => {
          const totalImages = displayImages.length;

          const baseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverRotation
                : (index - 1) * hoverRotation;

          const hoverY = hoverTranslateY - (totalImages - 1 - index) * 3;
          const hoverX =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverSpread
                : (index - 1) * hoverSpread;

          const teaseY = -4 - (totalImages - 1 - index) * 1;
          const teaseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * 3
                : (index - 1) * 3;

          return (
            <motion.div
              key={index}
              className="absolute top-0.5 left-1/2 origin-bottom overflow-hidden rounded-[4px] bg-white shadow-md ring-1 shadow-black/15 ring-black/10 dark:bg-neutral-800 dark:shadow-white/10 dark:ring-white/10"
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
                stiffness: 400,
                damping: 25,
                delay: index * 0.03,
              }}
              style={{
                zIndex: 10 + index,
              }}
            >
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}

        {/* Book Front Cover (opens on hover) */}
        <motion.div
          className="absolute inset-0 origin-left rounded-r-[3px]"
          style={{
            left: spineWidth,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            transformStyle: "preserve-3d",
            zIndex: 20,
            boxShadow: "0 1px 4px rgba(99, 102, 241, 0.2)",
          }}
          animate={{
            rotateY: isHovered ? -65 : -5,
            scaleX: isHovered ? 0.85 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        >
          {/* Cover decoration - small book emblem */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: bookSize.width * 0.35,
              height: bookSize.width * 0.35,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: bookSize.width * 0.15,
                height: bookSize.width * 0.2,
                border: "1.5px solid rgba(255,255,255,0.4)",
                borderRadius: "0 2px 2px 0",
              }}
            />
          </div>

          {/* Cover line details */}
          <div
            className="absolute"
            style={{
              top: bookSize.height * 0.15,
              left: "15%",
              right: "15%",
              height: 1,
              background: "rgba(255,255,255,0.15)",
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: bookSize.height * 0.15,
              left: "15%",
              right: "15%",
              height: 1,
              background: "rgba(255,255,255,0.15)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Text */}
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {text}
      </span>
    </Component>
  );
}
