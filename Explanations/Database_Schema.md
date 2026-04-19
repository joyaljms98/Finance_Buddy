# Finance Buddy — Complete Database Schema

This document describes all database collections used in the Finance Buddy backend. It is derived directly from backend model files and API usage, including all updated fields and sync components.

## 1. USERS (`users`)
**Source:** `app/models/user.py`
**Description:** Stores authentication and core user details.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId / str | MongoDB primary key |
| `user_id` | str | Unique sequential identifier (e.g., "0000001") |
| `name` | str | Full name |
| `email` | str | Unique email address |
| `role` | str | Admin / Editor / User |
| `hashed_password` | str | Encrypted password |
| `is_onboarded` | bool | Setup completion flag |
| `status` | str | Account status (e.g., "Active") |
| `created_at` | datetime | Account creation timestamp |

## 2. TAX_PROFILES (`tax_profiles`)
**Source:** `app/models/user.py` & `app/api/tax_profile.py`
**Description:** Stores user financial and tax-related profiles (can be multiple per user).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Reference to user's `user_id` |
| `profileFor` | str | Owner (e.g., "me (main)", spouse, etc.) |
| `name` | str | Profile name |
| `dob` | str | Date of birth |
| `ageCategory` | str | Age category for tax slabs |
| `residentialStatus` | str | Tax residency status |
| `residentSubStatus` | str | Sub-status for residency |
| `stayDaysInIndia` | float | Number of days stayed in India |
| `employmentSource` | str | Primary source of income/employment |
| `isGovtEmployee` | bool | Government employee flag |
| `businessTurnover` | float | Annual business turnover |
| `professionalReceipts` | float | Receipts from profession |
| `optPresumptiveTax` | bool | Flag for presumptive taxation |
| `auditRequired` | bool | Tax audit requirement flag |
| `maritalStatus` | str | Marital status |
| `taxFilingStatus` | str | Tax filing category |
| `spouseAssetTransfer` | bool | Flag for asset transfer to spouse |
| `childrenCount` | int | Number of children |
| `payTuitionFee` | bool | Pays tuition fees flag (for 80C) |
| `minorChildIncome` | bool | Minor child income inclusion flag |
| `dependentDisability` | bool | Dependent with disability flag |
| `taxRegime` | str | Old / New tax regime selection |
| `selfDisability` | str | Self disability status |
| `specificDisease` | bool | Specific disease flag (for 80DDB) |
| `hasVDA` | bool | Virtual Digital Assets (Crypto) flag |
| `hasCapitalGains` | bool | Capital gains flag |
| `hasHealthInsurance` | bool | Health insurance active flag |
| `hasLifeInsurance` | bool | Life insurance active flag |
| `annualIncome` | float | Total annual income |
| `monthlyExpenses` | float | Estimated monthly expenses |
| `savings` | float | Total savings |
| `riskTolerance` | str | Investment risk tolerance level |
| `goals` | str | Financial goals description |
| `updated_at` | datetime | Last updated timestamp |

## 3. ARTICLES (`articles`)
**Source:** `app/models/article.py`
**Description:** Knowledge base articles managed by admins/editors.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `title` | str | Article title |
| `description` | str | Short summary |
| `content` | str | Full content |
| `contentType` | str | Format (markdown / pdf) |
| `section` | str | Section name |
| `folder` | str | Folder grouping |
| `category` | str | Topic category |
| `tags` | str | Comma-separated keywords |
| `authors` | list[str] | Author names |
| `readTime` | int | Estimated reading time in minutes |
| `read_count` | int | View counter |
| `status` | str | Draft / Published |
| `created_at` | datetime | Created time |

## 4. CASHBOOK_BOOKS (`cashbook_books`)
**Source:** `app/models/cashbook.py`
**Description:** Represents user accounts/ledgers.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Owner's `user_id` |
| `name` | str | Book/Account name |
| `initialBalance` | float | Starting balance |
| `isSystem` | bool | Default/system flag |

## 5. CASHBOOK_HEADS (`cashbook_heads`)
**Source:** `app/models/cashbook.py`
**Description:** Categories for transactions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Owner's `user_id` |
| `name` | str | Category name |
| `type` | str | income / expense |
| `isSystem` | bool | Default/system flag |

## 6. CASHBOOK_TRANSACTIONS (`cashbook_transactions`)
**Source:** `app/models/cashbook.py`
**Description:** Individual financial transactions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Owner's `user_id` |
| `bookId` | str | Reference to `cashbook_books` |
| `headId` | str | Reference to `cashbook_heads` |
| `amount` | float | Transaction amount |
| `description` | str | Notes / details |
| `type` | str | income / expense |
| `date` | str / datetime | Date of transaction |
| `isRecurring` | bool | Recurring flag |
| `recurringType` | str | Recurrence schedule type |

## 7. USER_SYNCED_DATA (`user_synced_data`)
**Source:** `app/api/sync.py`
**Description:** Stores synchronized frontend state data for users.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Reference to `users` |
| `budgets` | list/dict | Synced budget state |
| `goals` | list/dict | Synced financial goals |
| `notes` | list/dict | Synced sticky notes state |
| `knowledge` | list/dict | Synced knowledge bookmarks |
| `folders` | list/dict | Synced folder structures |
| `updated_at` | datetime | Last sync timestamp |

## 8. BUDGETS (`budgets`)
**Source:** `app/rag/router.py` (Queried by Engine)
**Description:** System records of monthly/category budgets used for context generation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Reference to `users` |
| `...` | dynamic | Additional budget constraints and limits |

## 9. NOTES (`notes`)
**Source:** `app/models/communication.py`
**Description:** Personal notes created by users.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `user_id` | str | Owner's `user_id` |
| `title` | str | Note title |
| `content` | str | Content body |
| `folder` | str | Assigned folder |
| `created_at` | datetime | Created timestamp |
| `updated_at` | datetime | Updated timestamp |

## 10. FEEDBACK (`feedback`)
**Source:** `app/models/communication.py`
**Description:** User feedback and system responses.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `sender_id` | str | Reference to `users` |
| `senderName` | str | Sender's name |
| `senderRole` | str | Sender's role |
| `time` | str / datetime | Submission time |
| `type` | str | Feedback category |
| `title` | str | Subject |
| `content` | str | Main message |
| `status` | str | Status (e.g., "New", "Resolved") |
| `replies` | list[dict] | Embedded reply objects |

**Embedded Structure: Replies**
| Field | Type | Description |
| :--- | :--- | :--- |
| `sender` | str | Sender name/role |
| `time` | str / datetime | Reply time |
| `content` | str | Reply body |

## 11. REMINDERS (`reminders`)
**Source:** `app/models/communication.py`
**Description:** Notifications/reminders for users/groups.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `title` | str | Reminder title |
| `description` | str | Details |
| `date` | str | Scheduled date |
| `targetGroup` | str | Audience (e.g., "All Users") |
| `createdBy` | str | Creator's identifier |
| `createdAt` | str | Creation time |

## 12. CHAT_SETTINGS (`chat_settings`)
**Source:** `app/rag/models.py`
**Description:** Configuration for chatbot and RAG system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | ObjectId | MongoDB primary key |
| `admin_id` | str | Admin identifier (usually "global") |
| `rag_folder_path` | str | Path to RAG documents |
| `ai_model` | str | Model identifier (e.g., "gemini-2.0-flash") |
| `provider` | str | "gemini" or "ollama" |
| `ollama_endpoint` | str | Local endpoint for Ollama fallback |
| `embedding_model` | str | Embedding model string |
| `temperature` | float | Randomness parameter |
| `max_tokens` | int | Output token limit |
| `chunk_size` | int | Vector chunk size |
| `top_k` | int | Number of chunks to retrieve |
| `system_prompt` | str | Core AI instruction prompt |
| `updated_at` | datetime | Last updated timestamp |

## 13. CHAT_CONVERSATIONS (`chat_conversations`)
**Source:** `app/rag/models.py`
**Description:** Stores chat sessions with embedded messages.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` / `_id` | str / ObjectId | Conversation ID |
| `user_id` | str | Owner's `user_id` |
| `title` | str | Chat title |
| `messages` | list[dict] | Embedded message objects |
| `created_at` | datetime | Created timestamp |
| `updated_at` | datetime | Updated timestamp |

**Embedded Structure: Messages**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | str | Unique message ID |
| `sender` | str | "user" or "ai" |
| `text` | str | Message content |
| `timestamp` | datetime | Message time |

## 14. ROLES (`roles`)
**Source:** `app/api/roles.py`
**Description:** Stores system roles configuration.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | str | Hardcoded primary key: `"global_roles"` |
| `roles` | list[str] | List of defined system roles |

## 15. VECTOR STORE (`rag_docs` – ChromaDB)
**Source:** `app/rag/engine.py`
**Description:** Stores document embeddings for the RAG system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `documents` | str | Chunked text content |
| `ids` | str | Unique chunk identifiers |
| `metadatas` | dict | Source metadata (e.g., file path, index) |
| `embeddings` | list[float] | Generated vector embeddings |

---

## 🔗 RELATIONSHIPS SUMMARY

* **USERS → TAX_PROFILES** (1 : 0..*)
* **USERS → USER_SYNCED_DATA** (1 : 1)
* **USERS → BUDGETS** (1 : N)
* **USERS → BOOKS** (1 : N)
* **USERS → HEADS** (1 : N)
* **USERS → TRANSACTIONS** (1 : N)
* **USERS → NOTES** (1 : N)
* **USERS → FEEDBACK** (1 : N)
* **USERS → CHAT_CONVERSATIONS** (1 : N)
* **USERS → REMINDERS** (1 : N)
* **USERS → CHAT_SETTINGS** (1 : 1) *(Global, via Admin)*
* **BOOKS → TRANSACTIONS** (1 : N)
* **HEADS → TRANSACTIONS** (1 : N)
* **FEEDBACK → REPLIES** (embedded)
* **CHAT_CONVERSATIONS → MESSAGES** (embedded)
