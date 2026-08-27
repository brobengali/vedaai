# 📝 PaperGrade AI — Smart Exam & Answer Sheet Evaluator

PaperGrade AI is an intelligent document evaluation web app designed to take the manual hassle out of grading handwritten student exams. By leveraging Google's **Gemini 3.6 Flash** vision model, the app transcribes handwriting, maps answers to printed questions (even if answered out of order), calculates scores, and highlights bounding box regions directly on the original document.

---

## ✨ Features

- **📄 Dual Document Processing**: Upload a printed Question Paper alongside a handwritten student Answer Sheet (PDF, PNG, JPG, WEBP).
- **✍️ Advanced Handwritten OCR**: Recognizes cursive, messy, or printed student handwriting with high precision.
- **🎯 Out-of-Order Answer Mapping**: Automatically links student answers back to their corresponding question numbers—even when written out of sequence.
- **🔍 Sub-Question Breakdown**: Intelligent handling of sub-parts (e.g., Q11a, Q11b) evaluated as separate items.
- **📍 Bounding Box Highlights**: Visual overlay on the answer sheet showing exactly where each transcribed answer was found.
- **⚠️ Low Confidence Indicators**: Flags unclear handwriting or ambiguous mappings so evaluators can quickly review them manually.
- **📊 Comprehensive Reports & Export**: Detailed score summaries with printable grade cards.
- **🕒 Local Submission History**: Automatically saves graded exams in your browser for easy reference later.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Pure CSS (Modern Dark Mode with glassmorphism touches)
- **Backend API**: Vercel Serverless Function (`api/analyze-exam.js`)
- **AI Model**: Google Gemini 3.6 Flash (`gemini-3.6-flash`)

---

## 🚀 Getting Started Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Clone & Install

```bash
# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start using the app.

> **Note**: For local development, the app proxies requests through Vite directly to Gemini. You can optionally set your API key in environment variables or let it use the dev key.

---

## 🌐 Public Deployment (Vercel)

This project is pre-configured for a **Single Repository Vercel Deployment** with serverless backend API routes.

1. Push this repository to **GitHub**.
2. Go to **[Vercel Dashboard](https://vercel.com/dashboard)** and click **Add New → Project**.
3. Select your GitHub repository. Vercel will automatically detect the **Vite** preset.
4. Under **Environment Variables**, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `your_google_gemini_api_key` *(get one for free at [Google AI Studio](https://aistudio.google.com/))*
5. Click **Deploy**.

Your app will be live with a secure serverless API backend that hides your API key from public view!

---

## 🔒 Security & Privacy

Your Gemini API key is never exposed to the client bundle in production. All document processing requests pass through the serverless function (`/api/analyze-exam`), keeping your key hidden and safe from client-side inspection.

---

## 🤝 Feedback & Contributions

Feel free to open an issue or submit a pull request if you'd like to suggest improvements, add new features, or report bugs!
