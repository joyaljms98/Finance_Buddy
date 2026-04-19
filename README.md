# 🪙 Finance Buddy — The Intelligent Financial Ecosystem

Finance Buddy is a state-of-the-art, AI-powered personal finance management ecosystem designed to eliminate the anxiety and cognitive load of wealth management. Moving beyond the rigid limitations of traditional bookkeeping, the platform delivers a unified experience where a user's daily cashbook, sophisticated tax profile, evolving financial goals, budgets, and secure notes converge. 

Built on a robust, multi-role architecture supporting **Users, Editors, and Admins**, the system seamlessly maintains data security and role-specific workflows. It ensures that individuals are not simply tracking their expenses but are actively supported by an intelligent advisor that understands their specific financial context.

---

## 🚀 Key Modules & Capabilities

### 🏦 Smart CashBook & Ledger System
*   **Virtual Ledgers:** Manage multiple financial "books" with independent balances.
*   **Dynamic Heads:** Create custom income/expense categories to match your lifestyle.
*   **Budgeting Engine:** Plan future budgets based on historical cashflow data.
*   **Search & Filter:** Instantly locate transactions across various fiscal years.

### 👤 Advanced Tax Profiler (Indian Context)
*   **Contextual Onboarding:** Meticulously maps your financial status (Resident, NRI, Deemed Resident).
*   **Regime Optimization:** Intelligent comparison between Old vs. New (115BAC) tax regimes.
*   **Comprehensive Deductions:** Guided inputs for Sec 80C, 80D, 80U, 80DD, and specific chronic diseases.
*   **Modern Assets:** Support for VDA (Crypto) and Capital Gains reporting.

### 🤖 Hyper-Contextual AI Advisor (RAG)
*   **Contextual Intelligence:** Unlike generic bots, this advisor "senses" your live balances, goals, and tax status before answering.
*   **Retrieval-Augmented Generation:** Queries a curated knowledge base of CA-level documentation to provide professional advice.
*   **Model Flexibility:** Support for **Google Gemini 2.0+** and localized, secure **Ollama** models.
*   **Real-time Insights:** Instant feasibility evaluations for your investment goals.

### 👑 Enterprise-Grade Admin & Editor Portals
*   **Role-Based Access Control (RBAC):** Granular permissions for content curators.
*   **Article Workspace:** A complete markdown-integrated system for publishing financial articles.
*   **WebSocket Feedback:** Real-time, bidirectional support tickets between users and admins.
*   **System Broadcasting:** Release global reminders and notifications to the entire user base.

---

## ⚙️ How it Works & Installation

Finance Buddy is designed for simple "one-click" deployment on Windows environments.

### 📋 Prerequisites
1.  **MongoDB:** Have **MongoDB Atlas** (Cloud) or **MongoDB Compass** (Local) running.
2.  **Ollama (Optional):** Turn on Ollama if you wish to use local, private models.
3.  **Gemini API Key:** Obtain an updated API key from [Google AI Studio](https://aistudio.google.com/api-keys) and place it in your `.env` or system settings.

### 🏃 Running the Application
Simply double-click the **`launcher.bat`** file in the root directory. 
This batch script will automatically:
1.  Start the **FastAPI Backend**.
2.  Initialize the **Next.js Frontend**.
3.  Verify database connectivity.

---

## Tech Stack Usage Breakdown

---

### ✅ **ACTIVELY USED**

#### Frontend: Next.js / React
- **Where:** Entire UI framework  
- **Why:** Server-side rendering, optimized performance, file-based routing  
- **Evidence:** `next.config.ts`, all pages in `src/app/`

#### Frontend: Tailwind CSS
- **Where:** All component styling  
- **Why:** Utility-first CSS framework for rapid UI development  
- **Evidence:** `tailwind.config.ts`, `globals.css`, className utilities across components

#### Frontend: **Lucide React** ⭐
- **Where:** Icons throughout the entire UI (50+ imports found)  
- **Why:** Lightweight, tree-shakeable icon library  
- **Evidence:**  
  - `from 'lucide-react'` in 30+ component files  
  - Usage: `<TrendingUp />`, `<Send />`, `<Bot />`, `<Target />`, etc.

#### Frontend: **Recharts** ⭐
- **Where:** Dashboard charts and visualizations  
- **Why:** React charting library for financial data visualization  
- **Evidence:**  
  - Imported in `dashboard/page.js`  
  - Used: `<BarChart>`, `<PieChart>`, `<Bar>`, `<Pie>` components

---

### Backend: FastAPI (Python)
- **Where:** REST API server (main.py)  
- **Why:** Modern, fast async framework for building APIs  
- **Evidence:** `fastapi==0.135.1` in requirements, routing decorators `@router.get()`, `@router.post()`

#### Backend: **Bcrypt** ⭐
- **Where:** Password hashing and verification  
- **Why:** Secure password storage  
- **Evidence:**  
  - security.py: `bcrypt.hashpw()`, `bcrypt.checkpw()`  
  - Used in auth: auth.py

#### Backend: **Python-Jose (JWT)** ⭐
- **Where:** Token authentication  
- **Why:** JWT token generation and validation for user sessions  
- **Evidence:**  
  - security.py: `jwt.encode()` for creating tokens  
  - deps.py: `jwt.decode()` for validating tokens

#### yfinance
- **Where:** Market data fetching  
- **Why:** Real-time stock/index prices  
- **Evidence:** market.py uses `yfinance.Ticker()` to fetch market data

---

### Databases

#### MongoDB
- **Where:** Primary document store for users, articles, feedback, cashbook entries  
- **Why:** Flexible schema for diverse financial data  
- **Evidence:** mongodb.py, collections accessed in all API endpoints

#### ChromaDB
- **Where:** Vector database for RAG semantic search  
- **Why:** Stores document embeddings for retrieval-augmented generation  
- **Evidence:** engine.py extensively uses ChromaDB for indexing and retrieval

---

### AI Engine

#### **Google GenAI SDK** ⭐
- **Where:** Gemini model integration for chatbot  
- **Why:** LLM for financial advice generation  
- **Evidence:**  
  - `google-generativeai==0.8.6`, `google-genai>=1.0.0` in requirements.txt  
  - engine.py:  
    - `GeminiEmbeddingFunction` class for embeddings  
    - `_gemini_stream()` method for streaming responses  
    - Gemini model: `"gemini-2.0-flash"`

#### **LangChain** ⭐
- **Where:** LLM orchestration layer  
- **Why:** Abstracts AI provider interactions, handles message formatting  
- **Evidence:**  
  - engine.py imports:  
    - `from langchain_ollama import ChatOllama, OllamaEmbeddings`  
    - `from langchain.schema import HumanMessage, SystemMessage`  
  - Used for Ollama fallback support

#### Sentence Transformers
- **Where:** Text embeddings for similarity search  
- **Why:** Backup embeddings provider  
- **Evidence:** `sentence-transformers==3.3.1` in requirements.txt

#### Ollama
- **Where:** Fallback LLM provider  
- **Why:** Local model support if Gemini is unavailable  
- **Evidence:** `ollama==0.6.1`, optional provider in `RAGSystem.initialize()`

---

## Summary Table

| Tech | Frontend | Backend | Status | Actively Used? |
|------|----------|---------|--------|---|
| Next.js | ✅ | — | Core | ✅ Yes |
| Tailwind CSS | ✅ | — | Core | ✅ Yes |
| **Lucide React** | ✅ | — | Core | ✅ **Yes** (50+ icon imports) |
| **Recharts** | ✅ | — | Data viz | ✅ **Yes** (charts on dashboard) |
| FastAPI | — | ✅ | Core | ✅ Yes |
| **Bcrypt** | — | ✅ | Security | ✅ **Yes** (password hashing) |
| **Python-Jose** | — | ✅ | Auth | ✅ **Yes** (JWT tokens) |
| MongoDB | — | ✅ | Database | ✅ Yes |
| ChromaDB | — | ✅ | Vector DB | ✅ Yes |
| **Google GenAI** | — | ✅ | AI | ✅ **Yes** (Gemini model) |
| **LangChain** | — | ✅ | AI | ✅ **Yes** (orchestration) |
| Moondream | — | — | Vision | ❌ **NO** (only in README) |

---

## 📈 Update Logs (Evolution of Finance Buddy)

### **v1.0 - Foundation (Dec 2025)**
*   Initial Cashbook and basic Ledger implementation.
*   Simple User registration.

### **v1.5 - The Tax Update (Feb 2026)**
*   Introduction of the comprehensive Tax Profile (Indian Context).
*   Added residential status and basic deduction trackers.

### **v2.0 - The Intelligence Update (March 2026)**
*   Integration of **RAG (Retrieval-Augmented Generation)**.
*   Admin Chatbot Settings and Knowledge Base indexing.
*   Role-Based Access for Editors.

### **v2.5 - Performance & Sync (April 2026)**
*   Implementation of **WebSocket-based** real-time feedback.
*   Unified Global Data Syncing for seamless frontend-backend harmony.
*   Advanced Smart Calendar with Goal & Note integration.

---

*Last Updated: April 2026*













