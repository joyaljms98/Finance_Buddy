# Finance Buddy — Complete Class Documentation

This document provides a **comprehensive, fully detailed description of all classes** present in the Finance Buddy backend (and relevant frontend structures). It is reconstructed from actual source code and enhanced for clarity, completeness, and academic/project documentation use.

---

# 1. CORE CONFIGURATION & DATABASE

## 1.1 Settings
**Location:** `Backend/app/core/config.py`
**Type:** Pydantic BaseSettings

### Purpose
Central configuration manager for the entire backend system. Loads environment variables and provides global access to settings.

### Attributes
* PROJECT_NAME: Name of the application
* VERSION: API version
* API_V1_STR: Base API route prefix
* SECRET_KEY: JWT signing key
* ALGORITHM: JWT algorithm (HS256)
* ACCESS_TOKEN_EXPIRE_MINUTES: Token expiry duration
* MONGODB_URI: MongoDB connection string
* DATABASE_NAME: Database name
* OLLAMA_HOST: Optional AI host
* GEMINI_API_KEY: API key for Gemini
* NEXT_PUBLIC_ADMIN_NAME: Demo admin credentials
* NEXT_PUBLIC_ADMIN_EMAIL: Demo admin credentials
* NEXT_PUBLIC_ADMIN_PASSWORD: Demo admin credentials
* NEXT_PUBLIC_DEMO_EDITOR_NAME: Demo editor credentials
* NEXT_PUBLIC_DEMO_EDITOR_EMAIL: Demo editor credentials
* NEXT_PUBLIC_DEMO_EDITOR_PASSWORD: Demo editor credentials
* NEXT_PUBLIC_DEMO_USER_NAME: Demo user credentials
* NEXT_PUBLIC_DEMO_USER_EMAIL: Demo user credentials
* NEXT_PUBLIC_DEMO_USER_PASSWORD: Demo user credentials

### Subclasses
* **Config**: Defines case_sensitive and env_file environment loading behavior.

---

## 1.2 Database
**Location:** `Backend/app/db/mongodb.py`
**Type:** Service Class

### Purpose
Handles MongoDB connection lifecycle state.

### Attributes
* client: AsyncIOMotorClient instance

### Related Functions (Out-of-class)
* connect_to_mongo()
* close_mongo_connection()
* get_database()

---

# 2. AUTHENTICATION & SECURITY RELATED STRUCTURES

(No explicit class, but tightly coupled with User models and JWT functions)

---

# 3. USER & TAX DOMAIN MODELS

## 3.1 UserBase
**Location:** `Backend/app/models/user.py`
### Purpose
Base schema for user-related data.
### Attributes
* name: str
* email: EmailStr
* role: str (Admin / Editor / User)
* is_onboarded: bool
* status: str

---

## 3.2 UserCreate
**Location:** `Backend/app/models/user.py`
### Purpose
Used during registration.
### Attributes
* inherits UserBase
* password: str

---

## 3.3 PasswordUpdate
**Location:** `Backend/app/models/user.py`
### Purpose
Handles password change requests.
### Attributes
* current_password: str
* new_password: str

---

## 3.4 UserInDB
**Location:** `Backend/app/models/user.py`
### Purpose
Represents stored user record.
### Attributes
* inherits UserBase
* id: str
* user_id: str
* hashed_password: str
* created_at: datetime

---

## 3.5 UserResponse
**Location:** `Backend/app/models/user.py`
### Purpose
Safe response model for frontend.
### Attributes
* inherits UserBase
* id: str
* user_id: str
* created_at: datetime

---

## 3.6 TaxProfile
**Location:** `Backend/app/models/user.py`
### Purpose
Represents complete financial + tax profile of a user.
### Attributes (Grouped)
* **Identity**: id, user_id, profileFor, name, dob, ageCategory
* **Residency & Compliance**: residentialStatus, residentSubStatus, stayDaysInIndia
* **Income & Work**: employmentSource, isGovtEmployee, businessTurnover, professionalReceipts
* **Tax Settings**: optPresumptiveTax, auditRequired, taxFilingStatus, taxRegime
* **Family Info**: maritalStatus, childrenCount
* **Deductions & Conditions**: spouseAssetTransfer, payTuitionFee, minorChildIncome, dependentDisability, selfDisability, specificDisease
* **Investments & Flags**: hasVDA, hasCapitalGains, hasHealthInsurance, hasLifeInsurance
* **Financial Data**: annualIncome, monthlyExpenses, savings, riskTolerance, goals
* **Metadata**: updated_at

---

# 4. ARTICLE / KNOWLEDGE BASE MODELS

## 4.1 ArticleBase
**Location:** `Backend/app/models/article.py`
### Purpose
Base schema for financial articles.
### Attributes
* title: str
* description: Optional[str]
* content: Optional[str]
* contentType: str ('markdown' or 'pdf')
* section: str
* folder: str
* category: str
* readTime: int
* tags: Optional[str]
* status: str

---

## 4.2 ArticleCreate
**Location:** `Backend/app/models/article.py`
### Purpose
Used when creating articles.
### Attributes
* inherits ArticleBase

---

## 4.3 ArticleUpdate
**Location:** `Backend/app/models/article.py`
### Purpose
Partial updates.
### Attributes
* title: Optional[str]
* description: Optional[str]
* content: Optional[str]
* contentType: Optional[str]
* section: Optional[str]
* folder: Optional[str]
* category: Optional[str]
* readTime: Optional[int]
* tags: Optional[str]
* status: Optional[str]

---

## 4.4 ArticleInDB
**Location:** `Backend/app/models/article.py`
### Purpose
Represents stored article.
### Attributes
* inherits ArticleBase
* id (alias _id): str
* authors: List[str]
* created_at: datetime
* read_count: int

---

## 4.5 ArticleResponse
**Location:** `Backend/app/models/article.py`
### Purpose
Response model. Includes an inner Config class (`populate_by_name`).
### Attributes
* inherits ArticleBase
* id: str
* authors: List[str]
* created_at: datetime
* read_count: int

---

# 5. CASHBOOK & ACCOUNTING MODELS

## 5.1 Book
**Location:** `Backend/app/models/cashbook.py`
### Purpose
Represents a financial ledger.
### Attributes
* id: Optional[str]
* user_id: Optional[str]
* name: str
* initialBalance: float
* isSystem: bool

---

## 5.2 Head
**Location:** `Backend/app/models/cashbook.py`
### Purpose
Transaction category.
### Attributes
* id: Optional[str]
* user_id: Optional[str]
* name: str
* type: str (income/expense)
* isSystem: bool

---

## 5.3 Transaction
**Location:** `Backend/app/models/cashbook.py`
### Purpose
Represents a financial entry.
### Attributes
* id: Optional[str]
* user_id: Optional[str]
* bookId: str
* headId: str
* amount: float
* description: str
* type: str (income/expense)
* date: str
* isRecurring: bool
* recurringType: str

---

# 6. COMMUNICATION & FEEDBACK MODELS

## 6.1 Reminder
**Location:** `Backend/app/models/communication.py`
### Purpose
System notifications.
### Attributes
* id: Optional[str]
* title: str
* description: str
* date: str
* targetGroup: str
* createdBy: Optional[str]
* createdAt: str

---

## 6.2 Note
**Location:** `Backend/app/models/communication.py`
### Purpose
User notes.
### Attributes
* id: Optional[str]
* user_id: str
* title: str
* content: str
* folder: str
* created_at: datetime
* updated_at: datetime

---

## 6.3 Reply
**Location:** `Backend/app/models/communication.py`
### Purpose
Feedback replies.
### Attributes
* sender: str
* time: str
* content: str

---

## 6.4 Feedback
**Location:** `Backend/app/models/communication.py`
### Purpose
User feedback/tickets.
### Attributes
* id: Optional[str]
* sender_id: Optional[str]
* senderName: str
* senderRole: str
* time: str
* type: str
* title: str
* content: str
* status: str
* replies: List[Reply]

---

# 7. MARKET MODEL

## 7.1 TickerResponse
**Location:** `Backend/app/api/market.py`
### Purpose
Represents market data response.
### Attributes
* name: str
* price: str
* change_pct: str
* is_positive: bool

---

# 8. RAG AI CHATBOT MODELS

## 8.1 ChatMessage
**Location:** `Backend/app/rag/models.py`
### Purpose
Represents a single chat message.
### Attributes
* id: str
* sender: str
* text: str
* timestamp: datetime

---

## 8.2 ChatConversation
**Location:** `Backend/app/rag/models.py`
### Purpose
Represents conversation history.
### Attributes
* id: str
* user_id: str
* title: str
* messages: List[ChatMessage]
* created_at: datetime
* updated_at: datetime

---

## 8.3 ChatSettings
**Location:** `Backend/app/rag/models.py`
### Purpose
Stores chatbot configuration.
### Attributes
* id: str
* admin_id: str
* rag_folder_path: str
* ai_model: str
* provider: str
* ollama_endpoint: str
* embedding_model: str
* temperature: float
* max_tokens: int
* chunk_size: int
* top_k: int
* system_prompt: str
* updated_at: datetime

---

## 8.4 ChatRequest
**Location:** `Backend/app/rag/models.py`
### Purpose
Incoming chat request schema.
### Attributes
* query: str
* chat_mode: str
* conversation_id: Optional[str]
* include_cashbook: bool
* include_goals: bool
* include_budget: bool
* include_profile: bool
* include_rag_docs: bool

---

## 8.5 ChatSettingsUpdate
**Location:** `Backend/app/rag/models.py`
### Purpose
Update chatbot settings.
### Attributes
* rag_folder_path: str
* ai_model: str
* provider: str
* ollama_endpoint: str
* embedding_model: str
* temperature: float
* max_tokens: int
* chunk_size: int
* top_k: int
* system_prompt: str

---

# 9. RAG ENGINE CLASSES

## 9.1 GeminiEmbeddingFunction
**Location:** `Backend/app/rag/engine.py`
**Type:** Custom Embedding Function (extends EmbeddingFunction)
### Purpose
Custom embedding generator using Gemini, wrapped for ChromaDB use.
### Attributes
* _client: genai.Client
* _model: str
### Methods
* `__init__(api_key: str, model: str)`
* `__call__(input: List[str]) -> List[List[float]]`: converts text into vectors

---

## 9.2 RAGSystem
**Location:** `Backend/app/rag/engine.py`
### Purpose
Core AI engine handling retrieval + generation using Gemini or Ollama.
### Attributes
* provider: str
* ai_model: str
* embedding_model: str
* temperature: float
* max_tokens: int
* system_prompt: str
* chunk_size: int
* top_k: int
* is_initialized: bool
* reindex_progress: int
* reindex_total: int
* reindex_status: str
* force_stop_reindex: bool
* _genai_client: Optional
* _chroma_client: Optional
* _collection: Optional
* _embedding_fn: Optional
* _ollama_llm: Optional
* _init_error: Optional[str]
### Methods
* `initialize()`
* `build_or_update_vectorstore()`
* `retrieve()`
* `_check_guardrails()`
* `generate_simple_stream()`
* `summarize_query()`
* `generate_context_stream()`
* `_gemini_stream()`
* `_ollama_stream()`

---

# 10. WEBSOCKET / REAL-TIME CLASS

## 10.1 FeedbackConnectionManager
**Location:** `Backend/app/api/communication.py`
### Purpose
Handles real-time feedback updates via WebSockets.
### Attributes
* active_connections: List[WebSocket]
### Methods
* `connect()`: Accepts socket connection.
* `disconnect()`: Drops socket connection.
* `broadcast()`: Sends messages across active channels.

---

# 11. FRONTEND (STRUCTURAL CLASSES)

(Note: Frontend uses React functional components and contexts, not traditional JS-rendered classes, but act structurally as system components.)

## Context Providers
**Location:** `Frontend/src/context/`

* **CashBookContext.jsx**: Manages the global state of the user's cashbook entries, ledgers, and books.
* **FeedbackContext.jsx**: Manages real-time feed updates and feedback state including WebSocket subscriptions.
* **FinancialYearContext.jsx**: Manages the selected financial year and globally cascades data scoping throughout the app.
* **PermissionsContext.jsx**: Manages roles and permissions for Editors and Admins.
* **RemindersContext.jsx**: Manages global reminders, notification state, and triggers.
* **UsersContext.jsx**: Provides authentication state, user metadata, and onboarding status.

## UI Components
**Location:** `Frontend/src/components/` (or nested within subdirectories)

* **AdminCheatcodeListener.jsx**: Hidden component listening for special inputs to trigger admin overrides or debug modes.
* **AdminLayoutClient.jsx**: Wrapper structure for the admin dashboard layout.
* **AdminSidebar.jsx**: Sidebar navigation menu tailored for Admin users.
* **AdminSidebarWrapper.jsx**: Wrapper to control visibility and layout of the AdminSidebar.
* **ArticleEditorForm.jsx**: Form component handling creation and editing of knowledge base articles.
* **ArticleGrid.jsx**: Grid layout to cleanly display financial articles.
* **ArticleModal.jsx**: Modal popup component displaying full article content.
* **ArticleSection.jsx**: Content section specifically for rendering an article on a page.
* **BackendGuard.jsx**: Navigation guard wrapping components and enforcing required authentication roles.
* **ContactSection.jsx**: UI section rendering support or organization contact details.
* **DashboardLayoutClient.jsx**: Main wrapper structure for the user personal dashboard framework.
* **EditorLayoutClient.jsx**: Wrapper structure for the editor dashboard layout.
* **EditorSidebar.jsx**: Sidebar navigation menu tailored for Editor users.
* **EditorSidebarWrapper.jsx**: Wrapper to control visibility and layout of the EditorSidebar.
* **FilterBar.jsx** *(in goals/)*: Filter controls for narrowing down financial goals.
* **FYPicker.jsx**: Component for users to toggle and select active financial years.
* **FeaturesSection.jsx**: Landing page visual block highlighting system capabilities.
* **GoalCard.jsx** *(in goals/)*: Visual card summarizing a specific financial goal logic and progress.
* **GoalModal.jsx** *(in goals/)*: Modal managing creation, editing, and mapping of financial goals.
* **HeroCTA.jsx**: Call to Action component commonly injected on homeviews.
* **HeroVisual.jsx**: Engaging promotional imagery or dynamic animations section.
* **MarketTicker.jsx**: Component utilizing internal state to display sliding market statistics (e.g. NIFTY, SENSEX).
* **Navbar.jsx**: Global top-level application navigation bar logic.
* **NotesDrawer.jsx**: Slide-out drawer component providing quick note-taking functionally.
* **NotesManager.jsx** *(in notes/)*: Deep management UI to handle, sort, and search user notes comprehensively.
* **RAGDocsViewer.jsx**: Interface to visually explore currently indexed uploaded RAG knowledge base documents.
* **ReindexProgressBubble.jsx**: Non-intrusive floating indicator communicating background RAG vector indexing state.
* **RightSidebar.jsx**: Contextual secondary layout menu surfacing smart insights or context-aware configurations.
* **Sidebar.jsx**: System standard side navigation schema mapped for generic authenticated users.
* **SmoothScroll.jsx**: Component natively wrapping elements to ensure fluid anchor link scrolling behaviors.
* **SystemGuardian.jsx**: Pre-load protector guaranteeing vital context states map correctly before rendering nested components.
* **TestChatbotDrawer.jsx**: Tooling drawer provided internally for admins and editors to interact and test chatbot instruction models.
* **ViewCounter.jsx**: Live component aggregating real-time tracking interactions (like article reads) through socket or continuous requests.

---

# FINAL SUMMARY

### Backend Classes
* Core/System: 3
* Models: 25
* RAG System: 2
* WebSocket: 1
* Total Backend Structures Analyzed: 31

### Frontend Structures
* Context Providers: 6
* UI Components: 33
* Total Frontend Structures Analyzed: 39

---

# ADDENDUM: LOGICAL SCHEMAS & UML MAPPING

While the classes above represent explicit python files and components, a comprehensive Class Diagram or UML schema must account for the following dynamically injected models and relationships:

## 1. Dynamic Synced Documents
The system uses generic dictionary payloads for syncing user assets, representing strong logical entities despite lacking explicit Pydantic schemas.

### UserSyncedData *(Logical Model)*
**Location:** dynamically validated in `Backend/app/api/sync.py`
**Type:** Document (MongoDB Collection `user_synced_data`)
* user_id: str
* budgets: JSON / Dictionary
* goals: JSON / Dictionary
* notes: JSON / Dictionary
* knowledge: JSON / Dictionary
* folders: JSON / Dictionary
* updated_at: datetime

### Budget *(Logical Model)*
**Location:** injected dynamically into UserSyncedData maps
**Type:** Embedded Schema
* No explicit Pydantic model. Managed directly via frontend API payload injection.

## 2. Embedded Models vs Independent Entities
When mapping out ER diagrams, note that the following models are **strictly embedded objects** and not standalone database tables/collections:
* **Reply**: Embedded exclusively as `List[Reply]` inside the `Feedback` entity.
* **ChatMessage**: Embedded exclusively as `List[ChatMessage]` inside the `ChatConversation` entity.

## 3. Notable Relationships (1:1 & 1:M)
For strict relationship mapping:
* `UserBase (1) ─── (1) TaxProfile`
* `UserBase (1) ─── (M) ChatConversation`
* `UserBase (1) ─── (1) UserSyncedData`
* `Book (1) ─── (M) Transaction`
* `Head (1) ─── (M) Transaction`

## 4. Documentation Notes on Casting
Fields like `date` in `Transaction` and `Reminder`, or `time` in `Reply`, are strictly typed as Python `str`. However, logically they are treated as ISO DateTime strings across the codebase UI interfaces.

---
This document serves as the **validated and detailed architectural ledger of classes/components inside Finance Buddy.**
