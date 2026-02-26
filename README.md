# AskMyNotes 📚🤖

**AskMyNotes** is a premium, subject-scoped study copilot designed to help students master their course material through grounded AI interactions. Built for speed and accuracy, it ensures that every answer is backed strictly by the notes you provide.

---

## 🌟 Key Features

### 🗂️ Three-Subject Setup
Organize your studying into exactly three dedicated subjects. Upload multiple PDF or TXT files per subject to build a comprehensive knowledge base for your exams.

### 🎯 Subject-Scoped Q&A
Switch between subjects seamlessly. The AI is strictly constrained to the context of the selected subject, preventing "hallucinations" or mixing data from different courses.

### 🛡️ Grounded Responses with Transparency
Every answer provided by AskMyNotes comes with:
- **Citations**: Specific file and section references.
- **Confidence Levels**: High/Medium/Low indicators so you know when to double-check.
- **Supporting Evidence**: Expandable snippets show the exact text the AI used to form its answer.

### 📝 Study Mode
Transform your notes into active learning tools:
- **5 Custom MCQs**: Complete with correct options and detailed explanations.
- **3 Short-Answer Questions**: Challenge yourself with model answers derived from your documents.

---

## 🎨 Premium Design
The interface features a modern **Glassmorphism** aesthetic with:
- Dynamic radial gradients.
- Smooth Framer Motion animations.
- Responsive sidebar navigation.
- High-contrast typography for readability.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository (if applicable) or navigate to the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
Start the development server:
```bash
npm run dev
```
Open the provided URL (typically `http://localhost:5173` or `5174`) in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite)
- **Animation**: Framer Motion
- **Icons**: Lucide-React
- **PDF Extraction**: PDF.js (pdfjs-dist)
- **Logic**: Subject-Scoped RAG Implementation (Simulated LLM for Demo)

---

## 🛡️ "Not Found" Policy
If the uploaded notes do not contain the answer, the system will respond with:
> *"Not found in your notes for [Subject]"*

No guessing. No fabrication. Just the facts.
