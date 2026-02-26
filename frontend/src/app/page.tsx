"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import BubbleMenu from "@/components/BubbleMenu";
import {
  DoodlePencil,
  DoodleStar,
  DoodlePaperPlane,
  DoodleBubble,
  DoodleNotebook,
  DoodleLightbulb,
} from "@/components/ui/doodle-elements";
import { ImagesBadge } from "@/components/ui/images-badge";

const COLORS = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#fbbf24",
  pink: "#f472b6",
  green: "#10b981",
  purple: "#8b5cf6",
  black: "#1a1825",
};

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    ariaLabel: "Home",
    rotation: -6,
    hoverStyles: { bgColor: COLORS.blue, textColor: "#ffffff" },
  },
  {
    label: "Chat",
    href: "/chat",
    ariaLabel: "Chat",
    rotation: 6,
    hoverStyles: { bgColor: COLORS.purple, textColor: "#ffffff" },
  },
  {
    label: "About",
    href: "#",
    ariaLabel: "About",
    rotation: -4,
    hoverStyles: { bgColor: COLORS.pink, textColor: "#ffffff" },
  },
  {
    label: "GitHub",
    href: "https://github.com",
    ariaLabel: "GitHub",
    rotation: 8,
    hoverStyles: { bgColor: COLORS.green, textColor: "#ffffff" },
  },
];

import { useRouter } from "next/navigation";
import { useFile } from "@/context/FileContext";

export default function Home() {
  const router = useRouter();
  const { setSelectedFile } = useFile();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    router.push("/chat");
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ===== BUBBLE MENU NAVBAR ===== */}
      <BubbleMenu
        logo={
          <span
            className="font-bold text-lg tracking-tight"
            style={{
              fontFamily: "'DotGothic16', sans-serif",
              color: COLORS.black,
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            AskMyNotes
          </span>
        }
        onMenuClick={() => { }}
        className=""
        style={{}}
        items={NAV_ITEMS}
        menuBg="#ffffffee"
        menuContentColor={COLORS.black}
        useFixedPosition={true}
      />
      {/* ===== CORNER METADATA (Portfolio Style) ===== */}
      <div className="absolute top-8 left-8 text-[10px] font-bold tracking-widest uppercase text-red-500">
        ASKMYNOTES // KNOWLEDGE BASE
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase text-red-500 text-center leading-tight">
        THIS BASE WAS MADE WITH A LOT OF<br />
        CREATIVITY AND <span className="inline-block border border-red-500 rounded-full px-2">LOVE</span>
      </div>
      <div className="absolute top-8 right-8 text-[10px] font-bold tracking-widest uppercase text-red-500">
        2025 // v1.0
      </div>

      <div className="absolute bottom-6 left-8 text-[10px] font-medium tracking-tight text-red-500">
        askmynotes.ai/beta1
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-tight text-red-500">
        hello@askmynotes.ai
      </div>
      <div className="absolute bottom-6 right-8 text-[10px] font-medium tracking-tight text-red-500">
        @askmynotes.jpg
      </div>

      {/* ===== GEOMETRIC SHAPES (Maximalist Accents) ===== */}
      {/* Blue Box left */}
      <motion.div
        className="absolute w-12 h-8 bg-blue-500 z-0"
        style={{ top: "20%", left: "12%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      />
      {/* Red Box center bottom */}
      <motion.div
        className="absolute w-8 h-12 bg-red-500 z-0"
        style={{ bottom: "15%", left: "35%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
      />
      {/* Yellow Box bottom right */}
      <motion.div
        className="absolute w-16 h-10 bg-yellow-400 z-0"
        style={{ bottom: "10%", right: "25%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      />
      {/* Blue Box right */}
      <motion.div
        className="absolute w-10 h-16 bg-blue-600 z-0"
        style={{ top: "55%", right: "15%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1 }}
      />
      {/* Purple Box top right */}
      <motion.div
        className="absolute w-32 h-14 bg-purple-400 z-0 opacity-80"
        style={{ top: "15%", right: "12%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
      />
      {/* Pink Box bottom left */}
      <motion.div
        className="absolute w-24 h-10 bg-pink-400 z-0 opacity-80"
        style={{ bottom: "20%", left: "10%" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      />

      {/* ===== MAIN CONTENT (Centered Typography) ===== */}
      <div className="relative z-10 flex flex-col items-center">

        {/* "Ask." (Pixel) */}
        <motion.div
          className="text-black select-none"
          style={{
            fontFamily: "'DotGothic16', sans-serif",
            fontSize: "clamp(4rem, 15vw, 10rem)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ask.
        </motion.div>

        {/* "to my" -> "Learn." (Script) */}
        <div className="relative flex items-center justify-center -mt-4 mb-2">
          <motion.div
            className="text-black select-none mr-24"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontStyle: "italic",
            }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Learn.
          </motion.div>

          {/* Red Arrow */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 mt-2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <svg width="200" height="40" viewBox="0 0 200 40" fill="none">
              <path d="M0 20H190" stroke={COLORS.red} strokeWidth="4" strokeLinecap="round" />
              <path d="M180 10L195 20L180 30" stroke={COLORS.red} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>

        {/* "Notes" (Serif Bold Italic with Oval) */}
        <div className="relative">
          <motion.div
            className="text-black select-none font-bold italic"
            style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: "clamp(5rem, 18vw, 12rem)",
              lineHeight: 0.9,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Notes
          </motion.div>

          {/* Red Oval Decoration */}
          <motion.div
            className="absolute -inset-x-12 -inset-y-4 border-[1px] border-red-500 rounded-[50%]"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ delay: 1.5, duration: 2 }}
          />

          {/* Small Stars around it */}
          <div className="absolute -right-8 -bottom-6">
            <DoodleStar size={40} color={COLORS.purple} delay={2} />
          </div>
          <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
            <DoodleStar size={30} color={COLORS.yellow} delay={2.2} />
          </div>
        </div>

        {/* Subtitle (Subtle and small) */}
        <motion.p
          className="mt-12 text-center max-w-sm text-black/60 uppercase tracking-widest font-bold"
          style={{ fontSize: "10px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          The ultimate space where your notes become interactive. Upload, query, and visualize with AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex gap-4 mt-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.5 }}
        >
          <Link
            href="/chat"
            className="rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #ef4444, #f43f5e)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Get Started
          </Link>
          <button
            className="rounded-2xl px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            style={{
              border: "2px solid rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              background: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            The Gallery
          </button>
        </motion.div>
      </div>

      {/* ===== BOOK AT BOTTOM CENTER ===== */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 20 }}
        transition={{ delay: 2, duration: 1, type: "spring", stiffness: 100 }}
      >
        <ImagesBadge
          coverImage="/bookie.png"
          images={[
            "UPLOAD NOTE",
            "https://assets.aceternity.com/pro/agenforce-2.webp",
            "https://assets.aceternity.com/pro/minimal-3-min.webp",
          ]}
          bookSize={{ width: 340, height: 240 }}
          teaserImageSize={{ width: 100, height: 75 }}
          hoverImageSize={{ width: 380, height: 260 }}
          hoverTranslateY={-280}
          hoverSpread={140}
          onFileSelect={handleFileSelect}
        />
      </motion.div>

      {/* ===== DOODLES SCATTERED (Maximalist) ===== */}
      <div className="absolute top-[25%] left-[20%] pointer-events-none">
        <DoodleStar size={120} color={COLORS.yellow} delay={0.5} />
      </div>
      <div className="absolute top-[15%] right-[25%] pointer-events-none transform rotate-12">
        <DoodlePaperPlane size={140} color={COLORS.blue} delay={0.8} />
      </div>
      <div className="absolute top-[40%] left-[8%] pointer-events-none transform -rotate-12">
        <DoodlePencil size={110} color={COLORS.red} delay={1} />
      </div>
      <div className="absolute top-[50%] right-[5%] pointer-events-none flex flex-col items-center">
        <DoodleNotebook size={100} color={COLORS.purple} delay={1.2} />
        <span className="text-[10px] uppercase font-bold text-black/20 mt-2 tracking-tighter">Hand-drawn</span>
      </div>
      <div className="absolute bottom-[25%] left-[15%] pointer-events-none">
        <DoodleLightbulb size={90} color={COLORS.yellow} delay={1.4} />
      </div>
      <div className="absolute bottom-[30%] right-[18%] pointer-events-none opacity-40">
        <DoodleBubble size={120} color={COLORS.pink} delay={1.6} />
      </div>

      {/* Floating Sparkles (SVG shapes inspired by image) */}
      <motion.div
        className="absolute top-[45%] left-[28%] text-blue-500 text-6xl font-thin select-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
      >
        +
      </motion.div>
      <motion.div
        className="absolute bottom-[35%] right-[32%] text-red-500 text-7xl font-thin select-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.7 }}
      >
        *
      </motion.div>

      {/* Global Style for the thin oval and specific layout tweaks */}
      <style jsx global>{`
        body {
          background-color: #ffffff;
        }
        .floating-accent {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
