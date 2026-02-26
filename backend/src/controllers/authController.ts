import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
    createUser,
    findUserByEmail,
    findUserById,
} from "../models/userStore";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_change_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ─── helpers ──────────────────────────────────────────────────────────────────
// jwt v9 uses a branded "StringValue" type for expiresIn — cast is safe.
const generateToken = (userId: string) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

// ─── SIGN UP ──────────────────────────────────────────────────────────────────
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "All fields are required." });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
            return;
        }

        // Check duplicate email
        if (findUserByEmail(email)) {
            res.status(409).json({ success: false, message: "Email already in use." });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = createUser({
            id: uuidv4(),
            name,
            email,
            passwordHash,
            createdAt: new Date(),
        });

        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
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

        const user = findUserByEmail(email);
        if (!user) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ success: false, message: "Invalid credentials." });
            return;
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            token,
            user: { id: user.id, name: user.name, email: user.email },
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
        const user = findUserById(payload.id);

        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        res.status(200).json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
