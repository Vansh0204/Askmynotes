# 📚 AskMyNotes - AI Study Assistant

> **Transform your static PDF notes into an interactive, high-fidelity AI tutoring experience.**

AskMyNotes is a premium, AI-powered study platform where your notes come to life. Upload your PDFs, get instant structured analysis, and engage with your materials through visual exploration, interactive chat, and immersive voice tutoring.

[**Explore the Architecture Document 🏗️**](./ARCHITECTURE.md)

---

## ✨ Features

### 🎙️ **Professor AI (Voice Tutoring)**
Engage in real-time, hands-free voice conversations with your study material. Features an animated AI Persona that listens, thinks, and speaks back to you using the Web Speech API and Groq's ultra-low latency LPU™ inference.

### 📖 **Interactive Book Exploration**
Experience your notes through a beautiful 3D-animated book interface. Hover to peek into different subjects, explore AI-generated topics, and get a bird's-eye view of your entire curriculum.

### 🤖 **Smart Tutoring with Citations**
Every answer provided by the AI is strictly grounded in your notes. Ask questions and see exactly where the information came from with verbatim citations and confidence metrics.

### 📝 **Dynamic Practice Room**
Challenge yourself with AI-crafted assessments generated directly from your context. Practice with Multiple Choice Questions (MCQs) and Short Answer prompts, complete with model answers and reasoning.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Animation:** [Motion](https://motion.dev/) (Framer Motion) & [GSAP](https://gsap.com/)
- **UI System:** [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Voice:** Web Speech API (STT/TTS)

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **AI Engine:** [Groq Cloud](https://groq.com/) (Llama 3.1 8B Instant)
- **PDF Engine:** [PDF-Parse](https://www.npmjs.com/package/pdf-parse)
- **Persistence:** Local JSON Storage for high-speed session management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Groq API Key (from [GroqCloud](https://console.groq.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vansh0204/Askmynotes-Mavericks.git
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   # Add your GROQ_API_KEY to .env
   npm install
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the App:** 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure Summary

- `/frontend`: Next.js application core UI and logic.
- `/backend`: Express server handling AI bridge and PDF extraction.
- `/ARCHITECTURE.md`: In-depth look at system design and data flow.

---

## 🏆 Project Status: Hackathon Ready 🚀
Built with speed, aesthetics, and intelligence in mind.
