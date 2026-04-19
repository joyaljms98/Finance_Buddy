# Finance Buddy: Chatbot & RAG Engine - Technical Documentation v2

This document serves as a comprehensive developer guide to the AI Chatbot and Retrieval-Augmented Generation (RAG) feature within Finance Buddy. It is designed to be easily understood by anyone new to the system, detailing what each feature and file is for.

---

## 1. Architecture Overview

The chatbot is built as an asynchronous service using **FastAPI** to stream responses using Server-Sent Events (SSE). It acts as a financial advisor capable of answering general questions ("Simple Chat" mode) or analyzing a user's exact financial situation by injecting live MongoDB data and custom knowledge-base documents into the Large Language Model (LLM) context ("Context Chat" mode).

### Core Architecture Files

The entire AI feature lives within the `Backend/app/rag/` folder:

*   **`engine.py`**: The "brain" of the chatbot. 
    *   **What it does:** Handles direct interactions with AI Providers (Google Gemini & local Ollama models). It manages custom ChromaDB vector embeddings, document file loading (PDF/MD/TXT), overlapping chunk generation, and final prompt assembly.
*   **`router.py`**: The API routing layer. 
    *   **What it does:** Defines the endpoints for chat (`/chat`), settings (`/settings`), indexing (`/reindex`), and history (`/history`). It acts as a bridge, translating user checkboxes from the frontend into live MongoDB aggregation queries to build the personal context payload for the brain (`engine.py`).
*   **`models.py`**: The schema definitions.
    *   **What it does:** Contains strictly typed Pydantic models (e.g., `ChatRequest`, `ChatSettingsUpdate`, `ChatMessage`) to validate incoming requests and maintain consistent database schemas.

---

## 2. Technology Stack & Packages

The chatbot leverages the following external libraries:

*   **`fastapi`**: For exposing the `/chat` endpoint using `StreamingResponse` to stream output text token-by-token for that "live typing" effect.
*   **`google-genai`**: Google's latest official SDK for directly interfacing with Gemini models (e.g., `gemini-2.0-flash`) for both text generation and vector embeddings.
*   **`langchain_ollama`**: An adapter for connecting to local Ollama endpoints (e.g., `http://127.0.0.1:11434`), allowing Finance Buddy to run 100% offline using Llama 3 or Mistral.
*   **`chromadb`**: An embedded local vector database (stored in `Backend/app/rag/chroma_db`). It stores the mathematical representations (embeddings) of paragraphs from uploaded documents, making it possible to search for content mathematically.
*   **`pypdf`**: Used to extract raw text rapidly from uploaded PDF tax documents.
*   **`yaml`**: Standard python package used to convert massive JSON responses from MongoDB into a cleanly indented YAML structure. This saves a massive amount of LLM tokens compared to standard JSON brackets.
*   **`motor`**: Asynchronous MongoDB driver used for all database queries and aggregations.

---

## 3. How "Context Mode" Works (Step-by-Step)

When a user selects "Context Chat", the backend dynamically pulls live data based on the features they checked. Here is exactly what happens under the hood when a query is sent to `/chat`:

### Phase 1: Data Gathering (MongoDB)
Based on checkboxes ticked by the user:
*   **Include Profile**: Fetches the user's tax profile(s), dropping internal `_id` fields. It includes personal info, age, medical conditions, marital status, and goals.
*   **Include Budgets**: Fetches up to 5 of the user's active spending limits.
*   **Include CashBook**: 
    1. Grabs the **10 most recent transactions**.
    2. Runs an **Aggregation Pipeline** (`$match` -> `$group`) to dynamically sum the incomes and expenses of all active cashbooks and calculate live **Bank Balances**.
*   **Serialization**: All fetched data is consolidated into a pure Python dictionary and dumped into a token-efficient YAML formatted string. 

### Phase 2: Knowledge Base Retrieval (ChromaDB)
If "Include RAG Documents" is enabled:
1.  **Intent Summarization**: `engine.py` sends a rapid, hidden request to the LLM to summarize the user's long, complicated question into a structured "15-word search intent".
2.  **Vector Search**: This extracted intent is mathematically embedded using the `gemini-embedding-001` model and cross-referenced against the local ChromaDB collection.
3.  **Result Retrieval**: The Top-5 matching document chunks (approx 1000 characters each) are returned.

### Phase 3: Prompt Assembly and Execution
The `full_system_prompt` is dynamically constructed containing:
1.  **The Base System Instruction**: e.g., *"You are Finance Buddy, an expert Indian CA and AI financial advisor..."* (This comes from Database settings or defaults).
2.  **Personal Context**: The literal string `=== USER PERSONAL CONTEXT (YAML) ===` followed by the user data.
3.  **RAG Context**: The literal string `=== KNOWLEDGE BASE RAG DOCUMENTS ===` followed by the vector search results.
4.  Everything is packaged and sent to the LLM via `generate_content_stream`. The server yields the response back to the client token-by-token.

---

## 4. The Unified System Prompt (Recent Update)

Recently, the system prompt architecture was simplified to be more token-efficient and globally consistent across both frontend default states and backend fallbacks.

**The Unified Base Prompt:**
> *"You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient."*

**Where is it defined?**
1.  **Frontend Initial State**: In `Frontend/src/app/admin/chatbot/page.js` (used before any settings are saved).
2.  **Backend Default Settings**: In `Backend/app/rag/router.py` (used for fallback routing).
3.  **Backend Startup Mechanism**: In `Backend/app/main.py` (pre-loads the setting to avoid "cold starts").
4.  Once an administrator saves the settings via the Admin UI, the prompt is stored in the **MongoDB `chat_settings`** collection under `{"admin_id": "global"}` and dynamically retrieved for all subsequent chats.

---

## 5. The Full Context Built Payload (Example)

Here is a conceptual blueprint of the exact prompt sent behind the scenes when a user asks a question, fully populated with sample data:

```text
You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient.

=== USER PERSONAL CONTEXT (YAML) ===
Profiles:
- name: Joyal
  profileFor: me
  age: 21
  maritalStatus: Single
  medicalConditions: Asthma
  annualIncome: 650000
  preferredRegime: Old Tax Regime
  dependents: 0
  goals:
  - name: Buy a Laptop
    target: 80000
    current: 45000
    deadline: '2026-08-15'
RecentCashbook:
- date: '2026-04-16T14:30:00'
  amount: 850.0
  type: expense
  desc: Asthma Inhaler and meds
- date: '2026-04-12T09:00:00'
  amount: 25000.0
  type: income
  desc: Part-time Salary
BankBalances:
- book_name: Personal Savings
  current_balance: 45000.50
- book_name: Everyday Wallet
  current_balance: 1250.00
Budgets:
- category: Health
  limit: 2000
  period: monthly
- category: Savings
  limit: 10000
  period: monthly
====================================

=== KNOWLEDGE BASE RAG DOCUMENTS ===
"Section 80D of the Income Tax Act allows a deduction of up to Rs. 25,000 per year for medical insurance premiums for self, spouse, and dependent children."
"Under Section 80DDB, expenses incurred on the treatment of specific medical diseases and ailments for self or dependents are eligible for deduction."
====================================

Please respond as Finance Buddy using the rules above.
```

**Token Consumption Warning:** Because all this contextual data is injected into the prompt over the wire, utilizing all checking options on a single query consumes a lot more prompt tokens than a regular chat. This is intentional to provide powerful insights, but it quickly consumes Gemini free-tier quotas during heavy use!

---

## 6. The Re-indexing System (Background Jobs)

Because the chatbot relies on a physical folder of documents, it needs a way to update the ChromaDB vector store when an admin adds or deletes a PDF or Text file.

*   When the `/reindex` endpoint is hit via the Admin panel, FastAPI leverages `BackgroundTasks` to send the job to the background, returning a success response so the UI doesn't freeze.
*   **Smart Hashing**: The backend generates an `index_state.json`. It maps file paths to their last modification time. It only loads, chunks, and embeds files that have been **added** or **modified**. Deleted files have their existing chunks erased.
*   **Progress Tracking**: Because embedding large documents takes time, chunks are inserted in batches of 100. Global variables track progress, allowing the frontend to poll `/reindex/progress` and display a live visual percentage tracker.

---

## 7. Security & Error Handling

*   **Prompt Injection Protection**: `engine.py` implements a `_check_guardrails` method that flags user attempts to forcefully override the system prompt (e.g., "ignore all previous instructions"). An `HTTPException` is thrown if triggered.
*   **Graceful Degradation**: If an AI provider rate limits the app (`429 Quota Exceeded`) or experiences a connection drop, the `try/except` block cleanly yields an error directly inside the chat bubble text box instead of crashing the Python server entirely.
*   **Sanitization**: `_clean_dict_for_yaml` drops all empty constraints `("")` and null (`None`) values from MongoDB documents before injecting them into the prompt. This strictly preserves valuable context tokens.

---

## 8. Frontend Interface Locations

If you are editing the User Interface relating to the chatbot, here is where those files reside:

1. **`frontend/src/app/admin/chatbot/page.js`**
   - **Role:** Control center for tweaking chatbot variables. Interfaces with the system via Admin privileges to toggle AI Providers, select models, adjust prompt rules, and trigger re-indexing.
2. **`frontend/src/app/dashboard/chat/page.js`**
   - **Role:** The primary Chatbot window for standard Users. Maintains conversation history and translates SSE event streams into "live typing" bubbles.
3. **`frontend/src/app/editor/chatbot/page.js`**
   - **Role:** A parallel Chatbot layout built specifically for Editor roles.
4. **`frontend/src/components/TestChatbotDrawer.jsx`**
   - **Role:** Admin developer testing sandbox accessed from the Admin Settings.
5. **`frontend/src/components/RAGDocsViewer.jsx`**
   - **Role:** UI visual validation of knowledge availability. Shows administrators exactly which Markdown and PDF files are mapped and readable by the RAG backend.
6. **`frontend/src/components/ReindexProgressBubble.jsx`**
   - **Role:** Loading synchronization status tracker for ChromaDB rebuilding.
