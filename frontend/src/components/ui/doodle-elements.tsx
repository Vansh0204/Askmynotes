"use client";

import React from "react";
import { motion } from "motion/react";

// Each doodle is an SVG drawn in a sketchy/hand-drawn style
// They pop in once on load, then float on scroll via parent

interface DoodleProps {
    className?: string;
    size?: number;
    color?: string;
    delay?: number;
    style?: React.CSSProperties;
}

function wrapDoodle(
    children: React.ReactNode,
    { className, delay = 0, style }: DoodleProps
) {
    return (
        <motion.div
            className={className}
            style={{ position: "absolute", ...style }}
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                delay,
                duration: 0.6,
                type: "spring",
                stiffness: 300,
                damping: 15,
            }}
        >
            {children}
        </motion.div>
    );
}

// --- Pencil doodle ---
export function DoodlePencil(props: DoodleProps) {
    const { size = 80, color = "#6366f1" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                {/* Pencil body */}
                <path
                    d="M22 58L55 25L62 32L29 65L18 66L22 58Z"
                    stroke={color}
                    strokeWidth="2.5"
                    fill={`${color}15`}
                />
                {/* Pencil tip */}
                <path d="M18 66L14 70" stroke={color} strokeWidth="2.5" />
                {/* Eraser */}
                <path d="M55 25L59 21L66 28L62 32" stroke={color} strokeWidth="2.5" fill={`${color}25`} />
                {/* Line detail */}
                <path d="M26 54L52 28" stroke={color} strokeWidth="1.5" opacity="0.4" />
            </g>
        </svg>,
        props
    );
}

// --- Star doodle ---
export function DoodleStar(props: DoodleProps) {
    const { size = 60, color = "#f59e0b" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M30 8L35 22L50 22L38 31L42 46L30 37L18 46L22 31L10 22L25 22Z"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`${color}20`}
            />
            {/* Sparkle lines */}
            <path d="M30 3V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M50 14L53 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <path d="M7 14L10 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>,
        props
    );
}

// --- Lightbulb doodle ---
export function DoodleLightbulb(props: DoodleProps) {
    const { size = 70, color = "#eab308" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round" stroke={color} strokeWidth="2.5">
                {/* Bulb */}
                <path
                    d="M35 12C24 12 18 20 18 28C18 34 22 38 26 42V48H44V42C48 38 52 34 52 28C52 20 46 12 35 12Z"
                    fill={`${color}15`}
                />
                {/* Base */}
                <path d="M26 48H44V54H26Z" fill={`${color}20`} />
                <path d="M30 54H40V58H30Z" />
                {/* Rays */}
                <path d="M35 4V8" strokeWidth="2" />
                <path d="M56 14L53 17" strokeWidth="2" />
                <path d="M14 14L17 17" strokeWidth="2" />
                <path d="M60 28H56" strokeWidth="2" />
                <path d="M14 28H10" strokeWidth="2" />
            </g>
        </svg>,
        props
    );
}

// --- Paper plane doodle ---
export function DoodlePaperPlane(props: DoodleProps) {
    const { size = 70, color = "#8b5cf6" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M10 35L58 12L42 58L32 38L10 35Z"
                    stroke={color}
                    strokeWidth="2.5"
                    fill={`${color}12`}
                />
                <path
                    d="M32 38L58 12"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.5"
                />
                {/* Trail dashes */}
                <path d="M6 38L2 40" stroke={color} strokeWidth="2" opacity="0.3" />
                <path d="M8 44L3 47" stroke={color} strokeWidth="2" opacity="0.2" />
            </g>
        </svg>,
        props
    );
}

// --- Squiggle underline doodle ---
export function DoodleSquiggle(props: DoodleProps) {
    const { size = 200, color = "#6366f1" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size * 0.15}
            viewBox="0 0 200 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 20C20 8 35 28 50 16C65 4 80 26 95 14C110 2 125 24 140 12C155 0 170 22 185 10C195 4 200 14 195 18"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
            />
        </svg>,
        props
    );
}

// --- Speech bubble doodle ---
export function DoodleBubble(props: DoodleProps) {
    const { size = 80, color = "#ec4899" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round">
                <path
                    d="M10 20C10 14 16 10 22 10H58C64 10 70 14 70 20V42C70 48 64 52 58 52H30L18 64V52H22C16 52 10 48 10 42V20Z"
                    stroke={color}
                    strokeWidth="2.5"
                    fill={`${color}10`}
                />
                {/* Dots */}
                <circle cx="30" cy="32" r="3" fill={color} opacity="0.5" />
                <circle cx="42" cy="32" r="3" fill={color} opacity="0.5" />
                <circle cx="54" cy="32" r="3" fill={color} opacity="0.5" />
            </g>
        </svg>,
        props
    );
}

// --- Book/notebook doodle ---
export function DoodleNotebook(props: DoodleProps) {
    const { size = 70, color = "#10b981" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round" stroke={color} strokeWidth="2.5">
                <rect x="14" y="10" width="42" height="52" rx="3" fill={`${color}10`} />
                {/* Spine */}
                <line x1="22" y1="10" x2="22" y2="62" opacity="0.5" />
                {/* Lines */}
                <line x1="28" y1="22" x2="48" y2="22" strokeWidth="1.5" opacity="0.3" />
                <line x1="28" y1="30" x2="46" y2="30" strokeWidth="1.5" opacity="0.3" />
                <line x1="28" y1="38" x2="44" y2="38" strokeWidth="1.5" opacity="0.3" />
                <line x1="28" y1="46" x2="42" y2="46" strokeWidth="1.5" opacity="0.3" />
                {/* Rings */}
                <circle cx="22" cy="18" r="2" fill={color} opacity="0.4" />
                <circle cx="22" cy="34" r="2" fill={color} opacity="0.4" />
                <circle cx="22" cy="50" r="2" fill={color} opacity="0.4" />
            </g>
        </svg>,
        props
    );
}

// --- Magnifying glass doodle ---
export function DoodleMagnifier(props: DoodleProps) {
    const { size = 65, color = "#3b82f6" } = props;
    return wrapDoodle(
        <svg
            width={size}
            height={size}
            viewBox="0 0 65 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g strokeLinecap="round" strokeLinejoin="round" stroke={color} strokeWidth="2.5">
                <circle cx="28" cy="28" r="16" fill={`${color}10`} />
                <line x1="40" y1="40" x2="56" y2="56" />
                {/* Shine */}
                <path d="M20 18C22 16 26 15 28 16" strokeWidth="2" opacity="0.4" />
            </g>
        </svg>,
        props
    );
}
