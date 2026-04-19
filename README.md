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

## 🛠 Tech Stack
*   **Frontend:** Next.js (React), Tailwind CSS, Lucide React, Recharts.
*   **Backend:** FastAPI (Python), Python-Jose (JWT), Bcrypt.
*   **Databases:** 
    *   **MongoDB:** Document persistence for users and financial data.
    *   **ChromaDB:** Vector storage for RAG semantic retrieval.
*   **AI Engine:** Google GenAI SDK, Moondream, LangChain.

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
