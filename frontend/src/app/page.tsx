"use client";

import React from "react";
import { motion } from "motion/react";
import BubbleMenu from "@/components/BubbleMenu";
import {
  DoodlePencil,
  DoodleStar,
  DoodleLightbulb,
  DoodlePaperPlane,
  DoodleBubble,
  DoodleNotebook,
} from "@/components/ui/doodle-elements";
import { ImagesBadge } from "@/components/ui/images-badge";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "#",
    ariaLabel: "Home",
    rotation: -6,
    hoverStyles: { bgColor: "#6366f1", textColor: "#ffffff" },
  },
  {
    label: "Features",
    href: "#",
    ariaLabel: "Features",
    rotation: 6,
    hoverStyles: { bgColor: "#8b5cf6", textColor: "#ffffff" },
  },
  {
    label: "About",
    href: "#",
    ariaLabel: "About",
    rotation: -4,
    hoverStyles: { bgColor: "#ec4899", textColor: "#ffffff" },
  },
  {
    label: "Contact",
    href: "#",
    ariaLabel: "Contact",
    rotation: 8,
    hoverStyles: { bgColor: "#10b981", textColor: "#ffffff" },
  },
];

export default function Home() {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: `
          linear-gradient(160deg,
            #f5f0e6 0%,
            #ece5d8 25%,
            #e8e0d0 50%,
            #f0e8da 75%,
            #f5efe4 100%
          )
        `,
      }}
    >
      {/* ===== Notebook-paper ruled lines ===== */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg, transparent, transparent 31px,
              #6366f1 31px, #6366f1 32px
            )
          `,
          backgroundSize: "100% 32px",
        }}
      />

      {/* Dotted texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #6366f1 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Doodly dashed frame */}
      <svg
        className="pointer-events-none absolute inset-4 sm:inset-8 z-0"
        width="calc(100% - 2rem)"
        height="calc(100% - 2rem)"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "calc(100% - 2rem)", height: "calc(100% - 2rem)" }}
      >
        <rect
          x="2" y="2"
          width="calc(100% - 4px)" height="calc(100% - 4px)"
          rx="24"
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="14 10"
          opacity="0.1"
          style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
        />
      </svg>

      {/* ===== BUBBLE MENU NAVBAR ===== */}
      <BubbleMenu
        logo={
          <span
            className="font-bold text-lg tracking-tight"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#2d2b3d",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            AskMyNotes
          </span>
        }
        items={NAV_ITEMS}
        menuBg="#ffffffee"
        menuContentColor="#2d2b3d"
        useFixedPosition={true}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 pt-24 pb-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-6xl w-full flex-grow justify-center">

          {/* LEFT — Title + subtitle */}
          <motion.div
            className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1
              className="font-bold leading-[0.92] select-none"
              style={{
                color: "#2d2b3d",
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                fontWeight: 800,
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
              >
                Ask.
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
              >
                Learn.
              </motion.span>
              <motion.span
                className="block"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.45,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 200,
                  damping: 14,
                }}
              >
                Notes
              </motion.span>
            </motion.h1>

            <motion.p
              className="max-w-md"
              style={{
                color: "#7c7a8a",
                fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
                fontWeight: 400,
                lineHeight: 1.6,
              }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              The ultimate space where your notes become interactive. Upload, query, and visualize with AI.
            </motion.p>

            <motion.div
              className="flex gap-4 mt-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <button
                className="rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/20 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Get Started
              </button>
              <button
                className="rounded-2xl px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  border: "2px solid rgba(99, 102, 241, 0.1)",
                  color: "#2d2b3d",
                  background: "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                The Gallery
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT — Book + surrounding doodles */}
          <motion.div
            className="relative flex items-center justify-center flex-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glow behind book */}
            <motion.div
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 400,
                height: 300,
                background:
                  "radial-gradient(ellipse, rgba(99, 102, 241, 0.08), transparent 70%)",
                filter: "blur(40px)",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* THE BOOK — Floating */}
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ImagesBadge
                coverImage="/bookie.png"
                images={[
                  "https://assets.aceternity.com/pro/agenforce-2.webp",
                  "https://assets.aceternity.com/pro/minimal-3-min.webp",
                  "https://assets.aceternity.com/pro/bento-4.png",
                ]}
                bookSize={{ width: 320, height: 230 }}
                teaserImageSize={{ width: 120, height: 86 }}
                hoverImageSize={{ width: 420, height: 300 }}
                hoverTranslateY={-340}
                hoverSpread={140}
              />
            </motion.div>

            {/* Doodles scattered around the book */}
            <DoodlePencil size={80} color="#6366f1" delay={0.5} style={{ top: "-10%", left: "-5%", position: "absolute" }} className="floating-doodle" />
            <DoodleStar size={60} color="#f59e0b" delay={0.7} style={{ top: "-5%", right: "5%", position: "absolute" }} className="floating-doodle" />
            <DoodleLightbulb size={65} color="#eab308" delay={0.9} style={{ top: "45%", left: "-15%", position: "absolute" }} className="floating-doodle" />
            <DoodlePaperPlane size={70} color="#8b5cf6" delay={0.6} style={{ top: "-2%", right: "-10%", position: "absolute" }} className="floating-doodle" />
            <DoodleBubble size={70} color="#ec4899" delay={1.0} style={{ bottom: "-2%", left: "-8%", position: "absolute" }} className="floating-doodle" />
            <DoodleNotebook size={65} color="#10b981" delay={1.1} style={{ bottom: "-5%", right: "0%", position: "absolute" }} className="floating-doodle" />
          </motion.div>
        </div>

        {/* BOTTOM — Compact Feature Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {[
            { title: "Smart Search", desc: "Find anything in seconds", icon: "🔍" },
            { title: "Visual Flow", desc: "See your notes fan out", icon: "✨" },
            { title: "AI Insights", desc: "Summarize & extract keys", icon: "🤖" }
          ].map((feat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm hover:border-indigo-200 transition-all text-center">
              <div className="text-2xl mb-2">{feat.icon}</div>
              <h3 className="text-base font-bold text-[#2d2b3d] mb-1">{feat.title}</h3>
              <p className="text-xs text-[#7c7a8a]">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Global CSS for floating animations */}
      <style jsx global>{`
        @keyframes floating {
          0% { transform: translate(0, 0) rotate(0); }
          50% { transform: translate(3px, -6px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0); }
        }
        .floating-doodle {
          animation: floating 4s ease-in-out infinite;
        }
        .floating-doodle:nth-child(2n) {
          animation-duration: 6s;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
