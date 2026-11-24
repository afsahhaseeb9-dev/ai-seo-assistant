#  CodeCraft SEO: AI Content and SEO Writing Assistant

> Autonomous AI copywriting studio and hybrid SEO scoring engine designed for small businesses to generate high-ranking blog posts, e-commerce product descriptions, and viral social media copy in both **English** and **Urdu (اردو)**.

##  Key Features

1. **Multi-Format Templates:**
   - **Blog Posts:** Compelling H1–H3 structured articles with meta descriptions, introduction hooks, and FAQ sections.
   - **Product Descriptions:** High-converting e-commerce listings with benefit-driven bullets, technical specifications, and urgency CTAs.
   - **Social Media Posts:** Scroll-stopping multi-platform copy (LinkedIn, Instagram, X/Twitter, Facebook) with viral hook frameworks and auto-generated trending hashtags.

2. **Bilingual & Writing Controls:**
   - **Languages:** Native English and authentic **Urdu (اردو)** with dynamic Right-To-Left (RTL) rendering and Nastaliq typography.
   - **Tones:** Professional, Casual, Persuasive, Enthusiastic, Witty, Storytelling, and Luxury.
   - **Length:** Short (~200w), Medium (~600w), and Long-form (~1200w).

3. **Hybrid SEO Scoring Engine (Rule-Based + Model-Based):**
   - **Keyword Density Tracker:** Real-time frequency counter auditing target keyword density with optimal range indicators (1.0%–2.5%).
   - **Heading Structure Audit:** Validates single H1 titles, H2/H3 distribution, and content scanability.
   - **Readability & Stats:** Calculates word count, average reading time, and sentence length variance.
   - **Model-Based Review:** LLM evaluation of search intent alignment and qualitative recommendations.
   - **Circular Gauge:** Animated 0–100 SVG score visualizer with color-coded status badges.

4. **In-Place Live Editor & Multi-Format Exports:**
   - Live markdown editor with instant **"Recount SEO"** re-scoring upon typing.
   - 1-click exports to **Markdown (`.md`)**, **HTML (`.html`)**, **Plain Text (`.txt`)**, and Copy to Clipboard.

5. **Saved Drafts & Brand Voice Profiles:**
   - Persistent draft library in MongoDB with one-click re-editing and deletion.
   - Custom Brand Voice persona manager ensuring consistent brand tone across campaigns.

---

##  Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express.js (ES Modules).
- **Database:** MongoDB & Mongoose (with automated in-memory fallback store).
- **AI Engine:** Google Gemini API (`@google/genai` SDK with resilient offline backup).
- **Testing:** Vitest automated test suite for deterministic SEO algorithms.

---

##  Getting Started

Follow these step-by-step instructions to set up the project locally.

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Git:** Installed and configured ([Download Git](https://git-scm.com/))
- **MongoDB:** Optional local MongoDB instance (Community Server) or MongoDB Atlas connection string. *(Note: The app contains an automated in-memory fallback store if MongoDB is not running).*

---

### 2. Clone the Repository

```bash
git clone https://github.com/afsahhaseeb9-dev/ai-seo-assistant.git
cd ai-seo-assistant
```

---

### 3. Environment Variable Requirements

Create a `.env` file inside the `server/` directory:

```bash
# Path: server/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_seo_assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Environment Variables Explained:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port number on which the backend server runs | `5000` |
| `MONGODB_URI` | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://localhost:27017/ai_seo_assistant` |
| `GEMINI_API_KEY` | Google Gemini API Key for LLM text generation | Optional (Runs in offline mock mode if omitted) |

>  **Obtaining a Gemini API Key:** You can generate a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

---

### 4. Database Setup Steps

#### Option A: Local MongoDB (Recommended)
1. Install and start [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB daemon service:
   ```powershell
   net start MongoDB
   ```
3. Set `MONGODB_URI=mongodb://localhost:27017/ai_seo_assistant` in `server/.env`.
4. Collections (`drafts` and `brandvoices`) will be automatically initialized by Mongoose upon first write.

#### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Obtain your connection URI (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_seo_assistant?retryWrites=true&w=majority`).
3. Paste the URI into `server/.env`.

#### Option C: Zero-Config In-Memory Fallback
If MongoDB is not installed or temporarily offline, the server automatically detects this and activates its **seamless in-memory store**. All API endpoints, draft saving, and brand voice presets will work without crashing.

---

### 5. Backend Installation & Execution

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run automated Vitest test suite
npm test

# Start the development server (runs with live-reload on port 5000)
npm run dev
```

Server health check is accessible at: `http://localhost:5000/api/health`

---

### 6. Frontend Installation & Execution

In a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

##  Automated Testing

The project includes unit tests verifying the deterministic rule-based SEO analysis engine, Urdu text handling, heading structure audits, and keyword density calculations.

To execute the test suite:
```bash
cd server
npm test
```

### Test Results:
```text
 ✓ tests/seoEngine.test.js (6 tests)
   ✓ should accurately calculate reading time based on word count
   ✓ should support both English and Urdu word extraction
   ✓ should calculate keyword density and flag optimal frequency (1-2.5%)
   ✓ should detect missing keywords and penalize score
   ✓ should audit H1 and H2 heading structure correctly
   ✓ should calculate overall rule-based SEO score within valid bounds (0-100)

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

---

##  API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/content/generate` | Generates content via Gemini and computes hybrid SEO score |
| `POST` | `/api/content/analyze-seo` | Re-evaluates keyword density and headings on edited drafts |
| `GET` | `/api/drafts` | Fetches all saved drafts with SEO metrics |
| `POST` | `/api/drafts` | Saves a new draft to the database |
| `DELETE` | `/api/drafts/:id` | Deletes a saved draft |
| `GET` | `/api/brand-voices` | Retrieves saved business brand voice personas |
| `POST` | `/api/brand-voices` | Creates a new custom brand voice profile |

---

##  Author
**Afsah Haseeb**  
- GitHub: [@afsahhaseeb9-dev](https://github.com/afsahhaseeb9-dev)
- Project: AI Content and SEO Writing Assistant (Project 4)