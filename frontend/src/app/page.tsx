"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  DoodlePencil,
  DoodleStar,
  DoodleLightbulb,
  DoodlePaperPlane,
  DoodleSquiggle,
  DoodleBubble,
  DoodleNotebook,
  DoodleMagnifier,
} from "@/components/ui/doodle-elements";
import { ImagesBadge } from "@/components/ui/images-badge";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Doodle scatter transforms driven by scroll
  const doodleY1 = useTransform(scrollYProgress, [0, 0.5], [0, -300]);
  const doodleY2 = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const doodleY3 = useTransform(scrollYProgress, [0, 0.5], [0, -400]);
  const doodleX1 = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const doodleX2 = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const doodleX3 = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const doodleRotate1 = useTransform(scrollYProgress, [0, 0.5], [0, -45]);
  const doodleRotate2 = useTransform(scrollYProgress, [0, 0.5], [0, 60]);
  const doodleRotate3 = useTransform(scrollYProgress, [0, 0.5], [0, -30]);
  const doodleOpacity = useTransform(scrollYProgress, [0.3, 0.55], [1, 0]);

  // Title fade on scroll
  const titleOpacity = useTransform(scrollYProgress, [0.15, 0.35], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0.15, 0.35], [1, 0.9]);

  // Book section appearance
  const bookOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const bookY = useTransform(scrollYProgress, [0.35, 0.55], [120, 0]);
  const bookRotateX = useTransform(scrollYProgress, [0.45, 0.65], [40, 0]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#f0eee6] overflow-x-hidden"
      style={{ height: "300vh", fontFamily: "var(--font-caveat), cursive" }}
    >
      {/* ====== HERO SECTION (sticky) ====== */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Dotted background pattern for doodly feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Doodly dashed border frame */}
        <div
          className="pointer-events-none absolute inset-6 sm:inset-12 rounded-3xl"
          style={{
            border: "3px dashed rgba(99, 102, 241, 0.15)",
            borderRadius: "2rem",
          }}
        />

        {/* ====== TITLE that fades on scroll ====== */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-2"
          style={{ opacity: titleOpacity, scale: titleScale }}
        >
          {/* Main title */}
          <motion.h1
            className="text-7xl sm:text-[9rem] lg:text-[12rem] font-bold leading-none tracking-tight text-center select-none"
            style={{ color: "#2d2b3d" }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block">Ask</span>
            <span className="block">
              My
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
                }}
              >
                Notes
              </span>
            </span>
          </motion.h1>

          {/* Squiggle underline under title */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <DoodleSquiggle
              size={280}
              color="#6366f1"
              delay={0.9}
              style={{ position: "relative" }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="mt-4 text-xl sm:text-2xl text-[#6b6880] max-w-md text-center leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            Upload your notes, let AI do the reading ✨
          </motion.p>
        </motion.div>

        {/* ====== DOODLE ELEMENTS — pop in once, scatter on scroll ====== */}

        {/* Pencil - top left */}
        <motion.div
          className="absolute"
          style={{
            top: "12%",
            left: "8%",
            y: doodleY1,
            x: doodleX1,
            rotate: doodleRotate1,
            opacity: doodleOpacity,
          }}
        >
          <DoodlePencil size={90} color="#6366f1" delay={0.3} style={{ position: "relative" }} />
        </motion.div>

        {/* Star - top right */}
        <motion.div
          className="absolute"
          style={{
            top: "8%",
            right: "12%",
            y: doodleY2,
            x: doodleX2,
            rotate: doodleRotate2,
            opacity: doodleOpacity,
          }}
        >
          <DoodleStar size={75} color="#f59e0b" delay={0.5} style={{ position: "relative" }} />
        </motion.div>

        {/* Lightbulb - left middle */}
        <motion.div
          className="absolute"
          style={{
            top: "40%",
            left: "5%",
            y: doodleY3,
            x: doodleX3,
            rotate: doodleRotate3,
            opacity: doodleOpacity,
          }}
        >
          <DoodleLightbulb size={80} color="#eab308" delay={0.6} style={{ position: "relative" }} />
        </motion.div>

        {/* Paper plane - right middle */}
        <motion.div
          className="absolute"
          style={{
            top: "35%",
            right: "6%",
            y: doodleY1,
            x: doodleX2,
            rotate: doodleRotate1,
            opacity: doodleOpacity,
          }}
        >
          <DoodlePaperPlane
            size={85}
            color="#8b5cf6"
            delay={0.4}
            style={{ position: "relative" }}
          />
        </motion.div>

        {/* Speech bubble - bottom left */}
        <motion.div
          className="absolute"
          style={{
            bottom: "18%",
            left: "12%",
            y: doodleY2,
            x: doodleX1,
            rotate: doodleRotate2,
            opacity: doodleOpacity,
          }}
        >
          <DoodleBubble size={90} color="#ec4899" delay={0.7} style={{ position: "relative" }} />
        </motion.div>

        {/* Notebook - bottom right */}
        <motion.div
          className="absolute"
          style={{
            bottom: "15%",
            right: "10%",
            y: doodleY3,
            x: doodleX2,
            rotate: doodleRotate3,
            opacity: doodleOpacity,
          }}
        >
          <DoodleNotebook size={80} color="#10b981" delay={0.8} style={{ position: "relative" }} />
        </motion.div>

        {/* Magnifier - top center-right */}
        <motion.div
          className="absolute"
          style={{
            top: "18%",
            right: "30%",
            y: doodleY1,
            x: doodleX3,
            rotate: doodleRotate2,
            opacity: doodleOpacity,
          }}
        >
          <DoodleMagnifier size={65} color="#3b82f6" delay={0.55} style={{ position: "relative" }} />
        </motion.div>

        {/* Extra star - bottom center */}
        <motion.div
          className="absolute"
          style={{
            bottom: "25%",
            left: "35%",
            y: doodleY2,
            x: doodleX1,
            rotate: doodleRotate1,
            opacity: doodleOpacity,
          }}
        >
          <DoodleStar size={50} color="#f97316" delay={0.9} style={{ position: "relative" }} />
        </motion.div>
      </div>

      {/* ====== BOOK SECTION (appears on scroll) ====== */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-8"
          style={{
            opacity: bookOpacity,
            y: bookY,
          }}
        >
          {/* Section title */}
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-[#2d2b3d] text-center"
            style={{ opacity: bookOpacity }}
          >
            Your Knowledge Book 📖
          </motion.h2>
          <motion.p
            className="text-xl text-[#6b6880] text-center max-w-lg"
            style={{ opacity: bookOpacity }}
          >
            Hover the book to peek at your notes
          </motion.p>

          {/* The big book component */}
          <motion.div
            className="relative"
            style={{
              perspective: "1200px",
              rotateX: bookRotateX,
            }}
          >
            {/* Doodly shadow under book */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: 220,
                height: 30,
                background:
                  "radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            <ImagesBadge
              text=""
              images={[
                "https://assets.aceternity.com/pro/agenforce-2.webp",
                "https://assets.aceternity.com/pro/minimal-3-min.webp",
                "https://assets.aceternity.com/pro/bento-4.png",
              ]}
              bookSize={{ width: 160, height: 200 }}
              teaserImageSize={{ width: 100, height: 72 }}
              hoverImageSize={{ width: 380, height: 270 }}
              hoverTranslateY={-290}
              hoverSpread={120}
            />
          </motion.div>

          {/* Doodly arrows pointing to book */}
          <motion.svg
            width="120"
            height="50"
            viewBox="0 0 120 50"
            fill="none"
            className="mt-2 opacity-40"
            style={{ opacity: bookOpacity }}
          >
            <path
              d="M10 40C30 35 50 10 60 8C70 6 90 30 110 25"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              fill="none"
            />
            <path
              d="M105 18L110 25L102 27"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </motion.svg>
        </motion.div>
      </div>
    </div>
  );
}
