import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_change_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── helpers ──────────────────────────────────────────────────────────────────
const generateToken = (userId: string) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "All fields are required." });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ success: false, message: "Email already in use." });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            passwordHash,
        });

        await newUser.save();

        const token = generateToken(newUser._id.toString());

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email },
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required." });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }

        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            token,
            user: { id: user._id.toString(), name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── GET ME (protected) ───────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.user as { id: string };
        const user = await User.findById(payload.id);

        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        res.status(200).json({
            success: true,
            user: { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt },
        });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
