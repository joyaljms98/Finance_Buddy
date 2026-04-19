# Finance Buddy: Chatbot & RAG Engine - Technical Documentation

This document serves as a comprehensive developer guide to the AI Chatbot and Retrieval-Augmented Generation (RAG) feature within Finance Buddy.

## 1. Architecture Overview

The chatbot is built as an asynchronous service using **FastAPI** to stream responses using Server-Sent Events (SSE). It acts as a financial advisor capable of answering general questions (Simple Mode) or analyzing a user's exact financial situation by injecting live MongoDB data and custom knowledge-base documents into the LLM context (Context Mode).

### Core Files
The entire feature lives within the `Backend/app/rag/` folder:

*   **`engine.py`**: The "brain". Handles direct interactions with AI Providers (Google Gemini & Ollama local models), custom ChromaDB vector embeddings, document file loading (PDF/MD/TXT), overlapping chunk generation, and prompt assembly.
*   **`router.py`**: The API layer. Defines endpoints for chat (`/chat`), settings (`/settings`), indexing (`/reindex`), and history (`/history`). Responsible for translating user checkboxes into live MongoDB aggregation queries to build the personal context payload.
*   **`models.py`**: Contains strictly typed Pydantic models (e.g., `ChatRequest`, `ChatSettingsUpdate`, `ChatMessage`) to validate incoming requests and maintain consistent database schemas.

---

## 2. Technology Stack & Packages

The chatbot leverages the following external libraries:

*   **`fastapi`**: For exposing the `/chat` endpoint using `StreamingResponse` to stream output text token-by-token.
*   **`google-genai`**: Google's latest official SDK for directly interfacing with Gemini models (`gemini-2.0-flash` etc) for both text generation and vector embeddings.
*   **`langchain_ollama`**: An adapter for connecting to local Ollama endpoints (e.g., `http://127.0.0.1:11434`), allowing Finance Buddy to run 100% offline using Llama 3 or Mistral.
*   **`chromadb`**: An embedded local vector database (stored in `Backend/app/rag/chroma_db`). It stores the mathematical representations (embeddings) of paragraphs from the uploaded documents.
*   **`pypdf`**: Used to extract raw text rapidly from uploaded PDF tax documents.
*   **`yaml`**: Standard python package used to convert massive JSON responses from MongoDB into a cleanly indented YAML structure. This saves a massive amount of LLM tokens compared to standard JSON brackets.
*   **`motor`**: Asynchronous MongoDB driver used for all database queries and aggregations.

---

## 3. How the "Context Mode" Works (Step-by-Step)

When a user selects "Context Chat", the backend dynamically pulls live data based on the features they checked. Here is exactly what happens in the `/chat` endpoint (`router.py`) and `generate_context_stream` (`engine.py`):

### Phase 1: Data Gathering (MongoDB)
*   **Include Profile**: The router fetches the user's tax profile(s), dropping internal `_id` fields. It includes personal info, age, medical conditions, marital status, and goals.
*   **Include Budgets**: Fetches up to 5 of the user's active limits.
*   **Include CashBook**: 
    1. Grabs the **10 most recent transactions**.
    2. Runs an **Aggregation Pipeline** (`$match` -> `$group`) to dynamically sum the incomes and expenses of all active cashbooks and calculate the live **Bank Balances**.
*   **Serialization**: All fetched data is consolidated into a pure Python dictionary (`context_data`) and dumped into a YAML formatted string. 

### Phase 2: Knowledge Base Retrieval (ChromaDB)
If "Include RAG Documents" is enabled:
1.  **Intent Summarization**: `engine.py` actually sends a rapid, hidden request to the LLM to summarize the user's long, complicated question into a structured "15-word search intent".
2.  **Vector Search**: This extracted intent is mathematically embedded using the `gemini-embedding-001` model and cross-referenced against the local ChromaDB collection.
3.  **Result Retrieval**: The Top-5 matching document chunks (approx 1000 characters each) are returned.

### Phase 3: Prompt Assembly and Execution
The `full_system_prompt` is constructed containing:
1.  The base `system_prompt` (from Settings).
2.  The literal string `=== USER PERSONAL CONTEXT (YAML) ===` followed by the YAML.
3.  The literal string `=== KNOWLEDGE BASE RAG DOCUMENTS ===` followed by the vector search results.
4.  The final strict behavioral instructions (e.g., "Act as an expert Indian Chartered Accountant...").
5.  Everything is packaged and sent to the LLM via `generate_content_stream`. The server yields the response back to the client token-by-token.

---

## 4. The Re-indexing System (Background Jobs)

Because the chatbot relies on a physical folder of documents (e.g., `C:/RAG_Folder`), it needs a way to update the ChromaDB vector store when a user adds or deletes a file.

*   When the `/reindex` endpoint is hit, FastAPI leverages `BackgroundTasks` to send the job to the background, immediately returning a success response so the UI doesn't hang.
*   **Smart Hashing**: The `build_or_update_vectorstore` function generates an `index_state.json`. It maps file paths to their last modification time.
*   When rebuilding, it compares the current folder state against this JSON file. It only loads, chunks (`_chunk_text`), and embeds files that have been **added** or **modified**. Deleted files simply have their corresponding UUID chunks ripped out of ChromaDB. 
*   **Progress Tracking**: Because ChromaDB can choke on thousands of embeddings simultaneously, the chunks are inserted in batches of 100. Global variables track `reindex_progress`, allowing the frontend to poll `/reindex/progress` and display a live progress bar.

---

## 5. Security & Error Handling

*   **Prompt Injection Protection**: `engine.py` implements a simple `_check_guardrails` method that flags attempts to forcefully override the system prompt (e.g., "ignore all previous instructions"). An `HTTPException` is thrown if triggered.
*   **Graceful Context Degradation**: If an AI provider rate limits the app (`429 Quota Exceeded`), the `try/except` block catching the stream cleanly yields an error directly inside the text box instead of crashing the local server.
*   **Sanitization**: `_clean_dict_for_yaml` drops all empty constraints `("")` and null (`None`) values from MongoDB documents before injecting them into the prompt. This strictly preserves valuable token limits.
















Repetiton (the below is version 1 - old)


# Finance Buddy AI Chatbot & RAG Architecture

This document catalogs every exact file within the `Finance buddy` project workspace that implements the AI Chatbot and RAG (Retrieval-Augmented Generation) engine.

## Backend (Python/FastAPI)

1. **`Backend\app\rag\engine.py`**
   - **Role:** The core processing brain of the Chatbot. 
   - **Key Logic:** This contains the `RAGSystem` class. It manages the loading of text/pdf documents, splitting them into overlapping chunks, instantiating local `ChromaDB` databases, embedding paragraphs, and executing generative streams. It explicitly pivots behavior between Local Ollama via LangChain and Google Gemini via the new `google-genai` SDK.

2. **`Backend\app\rag\router.py`**
   - **Role:** Handles traffic passing from the frontend into the backend.
   - **Key Logic:** Acts as the API layer endpoints (`/chat`, `/history`, `/settings`, `/reindex`). Contains the logic necessary for fetching the admin's globally saved chat settings from MongoDB. In `chat_endpoint()`, it also dynamically gathers all of a user's Cashbook, Budget, and profile context, minifies it into a YAML format string, and passes it to `engine.py`. 

3. **`Backend\app\rag\models.py`**
   - **Role:** Enforces data structure safety using Pydantic.
   - **Key Logic:** Defines explicit formatting for `ChatSettings` structures, conversation history blobs, and incoming user queries (`ChatRequest`) making sure unknown properties are stripped.

4. **`Backend\app\main.py`**
   - **Role:** Controls application startup.
   - **Key Logic:** Contains the `@app.on_event("startup")` lifecycle hook. When you launch the backend, this code hits the MongoDB `chat_settings` table, finds the global configuration, and pre-warms/initializes the `.engine.py` singleton to prevent "cold start" wait-times on your first message. 

## Frontend (React/Next.js)

1. **`frontend\src\app\admin\chatbot\page.js`**
   - **Role:** The control center for tweaking chatbot variables.
   - **Key Logic:** Interfaces with the system via Admin privileges to toggle AI Providers (Ollama vs Gemini), tweak creativity variables (`temperature`), alter the global System Rules prompt, adjust `top_k` documents to pull from folders, and trigger global manual knowledge base re-indexing mappings.
   
2. **`frontend\src\app\dashboard\chat\page.js`**
   - **Role:** The primary Chatbot window for standard Users.
   - **Key Logic:** Maintains the local context of conversation messages on screen and translates backend event streams into "live typing" effects on UI chat bubbles.

3. **`frontend\src\app\editor\chatbot\page.js`**
   - **Role:** A parallel Chatbot layout built specifically for Editor roles.
   - **Key Logic:** Provides the exact same conversational functions as the Dashboard chat, but nested logically to keep Editor workflow menus contiguous. 

4. **`frontend\src\components\TestChatbotDrawer.jsx`**
   - **Role:** Admin developer testing sandbox.
   - **Key Logic:** A slide-out panel embedded in the Admin Chatbot Settings page allowing administrators to execute live queries bypassing the dashboard rules, guaranteeing correct system prompt tests. 

5. **`frontend\src\components\RAGDocsViewer.jsx`**
   - **Role:** UI visual validation of knowledge availability.
   - **Key Logic:** Polls a background endpoint to stream physical directory trees showing what Markdown and PDF documents the backend can legitimately "see" in the given context folder.

6. **`frontend\src\components\ReindexProgressBubble.jsx`**
   - **Role:** Loading synchronization status tracker.
   - **Key Logic:** Actively listens to `/reindex/progress` to draw visual percentage numbers in the admin interface when gigabytes of documents are potentially being embedded in the background into ChromaDB.

7. **`frontend\src\app\dashboard\page.js`**
   - **Role:** Home dashboard "AI Insight" generation.
   - **Key Logic:** Behind the scenes, the homepage uses the Chatbot API endpoints to secretly send the current financial totals and requests a quick 2-sentence "insight", rendering it under the "AI Insight" bubble.

## Gemini API Key Source

The key is technically physically located and retrieved from:
- **`Backend\.env`** 

The actual Python extraction occurs within `Backend\app\rag\engine.py` using `os.getenv("GEMINI_API_KEY")`. The variable is first made accessible to `os` memory early on when `Backend\app\main.py` explicitly invokes `load_dotenv(".env")` during the startup sequence.

















(More detail of the final prompt)


# Q
Just asking out of quriosity, 

as a user of Finance buddy (User login) will my transactions in the Cashbook , budgets and goals actually make a difference to the ai chatbot's answer if i choose the chat mode as context chat and tick all the options like :
Profile Information
RAG Documents Library
Include CashBook Details
Include Goals
Include Budgets

I am asking whether teh options are just placeholders or will the actual data in those like the transactions or goals or budget be actually sent as context to the chatbot as tokens (using Gemini api or to ollama). 

whether the answer to the above is yes or no, also tell me what all are sent as context to the chatbot along with the users qwuery and system prompt. Just tell me in detail

## Ans:

Yes, absolutely! **The options are not merely placeholders.** If you choose "Context Chat" and tick those options, the actual real data from your account is physically retrieved from the database, formatted, and sent as tokens to the actual AI model (Gemini or Ollama). 

This allows the chatbot to give highly personalized answers based on your actual spending, saved goals, and tax profile, rather than giving generic advice.

Here is a detailed breakdown of exactly what happens under the hood and what is sent to the chatbot when you enable these settings:

### What Gets Sent as Context?
When you send a message, the system dynamically generates a massive "System Prompt" before your query is ever processed by the AI. Here is exactly what goes into that prompt based on the checkboxes you tick:

#### 1. Profile Information (`Include Profile`)
If checked, the system searches your saved Tax Profiles. 
- It finds your "primary" profile, or any profile matching a name you mentioned in your chat. 
- It extracts your real details (such as age, income bracket, tax regime preference, etc.) and formats them into code-friendly YAML formatting.
- Internal database IDs are stripped away to save tokens, but the core financial profile data is sent directly to the AI.

#### 2. Goals (`Include Goals`)
In the database, your goals are actually attached to your Profile records.
- If you check "Include Goals", the system keeps the "goals" section inside the Profile data that it sends. 
- If unchecked, it actively deletes the goals from the temporary profile data before sending it to the model.

#### 3. CashBook Details (`Include CashBook Details`)
If checked, the system queries exactly your **10 most recent transactions** from the database.
- For each transaction, it sends the `date`, `amount`, `type` (e.g., income or expense), and `description`. 
- This allows the AI to answer questions like: *"How much did I spend on food recently?"* or *"Am I spending more than I'm earning this week?"*

##### Bank balances 
There is also the code to perfectly calculate and grab the live balances from all active cashbooks and place them right inside the context. 

I modified `Backend/app/rag/router.py`. Whenever `Include CashBook Details` is checked, the system now dynamically does the following:
1. Grabs all the active books and their initial balances.
2. Uses an ultra-fast aggregation query (`$group` and `$sum`) to calculate exactly how much income/expense has flowed into each book.
3. Automatically calculates the `current_balance` using: `Initial + Total Income - Total Expense`.
4. Stitches it straight into the YAML format that gets sent to the AI!

#### 4. Budgets (`Include Budgets`)
If checked, the system fetches up to **5 of your active budgets**.
- It passes the budget targets and categories to the AI.

#### 5. RAG Documents Library (`Include RAG Documents`)
Because sending an entire library of PDFs would consume far too many tokens (and likely exceed limits), this feature is handled with vector search:
- The system first asks the AI to cleanly summarize your main question into a "short 15-word search intent."
- It uses that intent to search through the ChromaDB "Vector Database" to find the **top 5 most relevant paragraphs** (1000 characters each) from your uploaded documents (PDFs, TXT, MD). 
- Only those exact, relevant textual paragraphs are attached to the prompt.

---

### How the Complete Context is Assembled 
Right before making the API request to Gemini or Ollama, the system stitches everything together in a specific format. Here is a conceptual blueprint of the exact prompt sent behind the scenes:

```text
[Base System Prompt]
"You are Finance Buddy, an AI financial advisor designed for the Indian context... (etc)"

=== USER PERSONAL CONTEXT (YAML) ===
Profiles:
  - name: Joyal
    age: 21
    goals:
      - name: Buy a Car
        target: 500000
RecentCashbook:
  - date: 2026-04-16
    amount: 150.0
    type: expense
    desc: "Lunch"
Budgets:
  - category: Food
    limit: 5000
====================================

=== KNOWLEDGE BASE RAG DOCUMENTS ===
[Paragraph 1 retrieved from a tax PDF]
[Paragraph 2 retrieved from a tax PDF]
====================================

"Answer the user's question concisely based on the above personal context and knowledge base. If uncertain, specify that you don't have enough information."

[Your Actual Chat Question]
"Based on my recent cashbook, how much of my food budget do I have left?"
```


### 1. Are all Profile details sent?
**Yes, absolutely.** If you look closely at how the backend extracts the profile (in `Backend/app/rag/router.py`), it does this:

```python
                        clean_p = _clean_dict_for_yaml(p)
                        clean_p.pop("_id", None)
                        clean_p.pop("user_id", None)
                        if not request.include_goals:
                            clean_p.pop("goals", None)
                        context_data["Profiles"].append(clean_p)
```

The system takes the **entire** profile object from your MongoDB database and only strips out:
1. `_id` (the internal database ID)
2. `user_id` (the internal user ID)
3. `goals` (ONLY if the "Include Goals" checkbox is missing)
4. Any fields that are completely empty/blank (to save tokens).

**Everything else in your profile is sent!** This means if your profile has `maritalStatus`, `medicalConditions`, `annualIncome`, `dependents`, `taxRegimePreference` or anything else, **all of those fields are successfully injected into the YAML context and read by the AI.**

***

### 2. Full Sample Prompt (with your recent code edit)

Here is exactly what the final text sent to the Gemini/Ollama API looks like when a user asks a question, fully populated with sample data and including the edit you just made to `engine.py`. 

*(Note: The first block is the default System Prompt from the admin settings).*

```text
You are Finance Buddy, an AI financial advisor designed for the Indian context. 
Your goal is to help users manage their personal finances, explain tax concepts, and provide budgeting advice.

Rules:
1. Always be polite and encouraging.
2. Use Simple English.
3. When discussing tax, refer to the latest Indian IT Act laws (FY 2025-26).
4. Do not provide specific stock recommendations (e.g., "Buy Reliance"). instead, explain concepts (e.g., "What is a Blue-chip stock?").

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

Act as an expert Indian Chartered Accountant. Deliver concise, clever financial strategies tailored strictly to the provided personal context and RAG documents. If evaluating a goal, assess its feasibility by cross-referencing the goal's target and deadline against current 'BankBalances', and recommend actionable steps using RAG insights. If data is insufficient, state it clearly.
```



find the above in Finance buddy\Backend\app\rag\router.pyengine.py and Finance buddy\Backend\app\rag\router.py





**Token Consumption Warning:** Because this actual content is sent over the wire, utilizing all these options on a single query consumes a lot more prompt tokens than a regular chat. This is intentional to provide powerful insights, but it means if you have extensive data, you will burn through your Gemini free-tier quota slightly faster when using Context Mode!