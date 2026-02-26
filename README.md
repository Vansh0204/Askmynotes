# 📚 AskMyNotes - AI Study Assistant

AskMyNotes is a premium, AI-powered study platform where your notes come to life. Upload your PDFs, get instant structured analysis, and chat with your material using state-of-the-art Large Language Models.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:**
  - [Tailwind CSS 4](https://tailwindcss.com/) (Next-gen utility-first CSS)
  - [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
  - [Lucide React](https://lucide.dev/) (Icon library)
- **Animation:** 
  - [Motion](https://motion.dev/) (formerly Framer Motion) for smooth UI transitions and portal-based dialogs.
  - [GSAP](https://gsap.com/) for complex scroll-triggered animations.
- **State Management:** React Hooks (useState, useCallback, useRef) & Context API.

---

### **Backend**
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js 5](https://expressjs.com/) (Latest experimental/v5)
- **Language:** TypeScript (via `ts-node-dev`)
- **AI Infrastructure:**
  - **Provider:** [Groq Cloud](https://groq.com/) (LPU™ Inference Engine)
  - **Model:** `llama-3.1-8b-instant` (Ultra-fast, high-accuracy reasoning)
- **File Handling:**
  - [Multer](https://github.com/expressjs/multer): Processing multipart/form-data uploads.
  - [PDF-Parse](https://www.npmjs.com/package/pdf-parse): Server-side text extraction from PDF documents.
- **Security & Utilities:**
  - **JWT:** JSON Web Token for secure session management.
  - **Bcryptjs:** Secure password hashing.
  - **UUID:** generating unique identifiers for chat sessions.
  - **CORS:** Cross-Origin Resource Sharing for frontend-backend communication.

---

### **Key Features**
- **Multi-File Subject Management:** Upload up to 100 PDFs for a single subject; the AI maintains a cumulative context of all materials.
- **AI-Generated Topics:** Automatically breaks down complex PDFs into structured topics, subtopics, and summaries.
- **Live Chat with Citations:** Answers questions strictly based on your notes with verbatim citations and confidence scores.
- **Premium UI/UX:** Glassmorphism effects, 3D book animations, and a responsive mobile-first design.
- **Persistence:** Local JSON storage (`chats.json`) for session recovery across reloads.

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
   cp .env.example .env
   # Add your GROQ_API_KEY to .env
   npm install
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

4. **Access the App:** 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure
- `/frontend`: Next.js web application.
- `/backend`: Express.js API server.
- `/backend/src/services`: Core logic for AI analysis and chat.
- `/backend/src/controllers`: Request handlers for uploads and sessions.
