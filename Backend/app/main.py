from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load backend .env first (GEMINI_API_KEY, MONGODB_URI, etc.)
load_dotenv(".env")
# Load frontend envs to grab demo user credentials
load_dotenv("../frontend/.env.local")

from app.core.config import get_settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api import auth, users, tax_profile, cashbook, communication, sync, market, roles, articles
from app.rag import router as chatbot_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Conversation-Id"],
)

from app.core.security import get_password_hash
from datetime import datetime

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    
    # Seed Initial Demo Users
    db = connect_to_mongo.__globals__["db"].client[settings.DATABASE_NAME]
    
    initial_users = [
        {
            "user_id": "0000001",
            "name": settings.NEXT_PUBLIC_ADMIN_NAME,
            "email": settings.NEXT_PUBLIC_ADMIN_EMAIL,
            "role": "Admin",
            "password": settings.NEXT_PUBLIC_ADMIN_PASSWORD,
            "status": "Active",
            "is_onboarded": True
        },
        {
            "user_id": "0000002",
            "name": settings.NEXT_PUBLIC_DEMO_EDITOR_NAME,
            "email": settings.NEXT_PUBLIC_DEMO_EDITOR_EMAIL,
            "role": "Editor",
            "password": settings.NEXT_PUBLIC_DEMO_EDITOR_PASSWORD,
            "status": "Active",
            "is_onboarded": True
        },
        {
            "user_id": "0000003",
            "name": settings.NEXT_PUBLIC_DEMO_USER_NAME,
            "email": settings.NEXT_PUBLIC_DEMO_USER_EMAIL,
            "role": "User",
            "password": settings.NEXT_PUBLIC_DEMO_USER_PASSWORD,
            "status": "Active",
            "is_onboarded": True
        }
    ]
    
    for u in initial_users:
        password = u.pop("password")
        hashed_password = get_password_hash(password)
        
        await db.users.update_one(
            {"user_id": u["user_id"]},
            {
                "$set": {
                    "name": u["name"],
                    "email": u["email"],
                    "role": u["role"],
                    "hashed_password": hashed_password,
                    "status": u["status"],
                    "is_onboarded": u["is_onboarded"],
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )

    # Seed Default Articles (only if none exist yet)
    article_count = await db.articles.count_documents({})
    if article_count == 0:
        admin_name = settings.NEXT_PUBLIC_ADMIN_NAME
        seed_articles = [
            {
                "title": "The Golden Ratio for Your Salary: A Smart Fund Allocation Guide",
                "description": "Discover the time-tested proportions for splitting your monthly income into needs, wants, savings, and investments — and build wealth on autopilot.",
                "content": """# The Golden Ratio for Your Salary

Managing your income wisely is the foundation of financial freedom. Here's a proven framework used by financial experts worldwide.

## The 50/30/20 Rule — A Starting Point

- **50%** → Needs (rent, groceries, bills, EMIs)
- **30%** → Wants (dining, entertainment, subscriptions)
- **20%** → Savings & Investments (FD, SIP, PPF, emergency fund)

## Level Up: The 40/20/20/20 Power Split

For those serious about wealth building:

- **40%** → Essential living expenses
- **20%** → Lifestyle & discretionary spending
- **20%** → Long-term investments (equity, mutual funds)
- **20%** → Short-term goals & emergency buffer

## Emergency Fund First

Before investing, ensure you have **3–6 months of expenses** saved as a liquid emergency fund in a high-interest savings account.

## Key Takeaway

Consistency beats perfection. Even if you can only save 10% right now, start today. Automate your SIPs and watch compounding work its magic over years.

> *"It's not about how much you earn — it's about how much you keep and grow."*
""",
                "contentType": "markdown",
                "section": "Financial Wisdom",
                "folder": "General",
                "category": "Personal Finance Tips",
                "readTime": 5,
                "tags": "salary, budgeting, allocation, savings, SIP",
                "status": "Published",
                "authors": [admin_name],
                "created_at": datetime.utcnow(),
                "read_count": 0
            },
            {
                "title": "Tax Saving Strategies 2026: Max Your Returns in India",
                "description": "A comprehensive guide to legally minimizing your tax burden in India for FY 2025-26 — from Section 80C to the new tax regime comparison.",
                "content": """# Tax Saving Strategies 2026: Max Your Returns in India

With the financial year approaching, now is the best time to plan your taxes strategically.

## Old vs New Tax Regime: Which is Better?

The **new tax regime** offers lower slab rates but removes most deductions. The **old regime** allows you to claim multiple deductions — better if your total deductions exceed ₹3.75 lakh.

## Top Deductions Under Section 80C (Up to ₹1.5 Lakh)

- **ELSS Mutual Funds** – Best returns, 3-year lock-in
- **PPF** – Safe, tax-free returns (~7.1%)
- **EPF contributions** – Auto-deducted, employer match
- **5-Year FD** – Low risk, guaranteed
- **Life Insurance Premiums** – Protection + deduction

## Additional Deductions to Know

| Section | Benefit | Limit |
|---------|---------|-------|
| 80D | Health Insurance | ₹25,000–₹1,00,000 |
| 80E | Education Loan Interest | No cap |
| 24(b) | Home Loan Interest | Up to ₹2 Lakh |
| 80CCD(1B) | NPS Investment | Extra ₹50,000 |

## Action Plan Before March 31st

1. Check remaining 80C room
2. Invest in ELSS for market-linked tax saving
3. Pay health insurance premiums
4. Start NPS for extra ₹50K deduction

> **Pro Tip:** Don't wait until March. Invest early in the FY to benefit from compounding throughout the year.
""",
                "contentType": "markdown",
                "section": "Financial Wisdom",
                "folder": "Tax Guides",
                "category": "Taxation",
                "readTime": 5,
                "tags": "tax, 80C, India, FY2026, ITR, savings",
                "status": "Published",
                "authors": [admin_name],
                "created_at": datetime.utcnow(),
                "read_count": 0
            },
            {
                "title": "Mutual Funds Demystified: A Beginner's Complete Guide",
                "description": "Everything you need to know about mutual funds — what they are, how NAV works, types of funds, risk levels, and how to start your first SIP today.",
                "content": """# Mutual Funds Demystified: A Beginner's Complete Guide

Mutual funds are one of the most powerful yet misunderstood investment tools available to Indian investors.

## What is a Mutual Fund?

A mutual fund pools money from many investors and invests it in a diversified portfolio managed by a **professional fund manager**. You own "units" of the fund.

## Key Concepts

- **NAV (Net Asset Value)**: The per-unit price of the fund. Changes daily.
- **SIP (Systematic Investment Plan)**: Invest a fixed amount monthly. Best for beginners.
- **Lump Sum**: Invest everything at once. Risky if timed poorly.
- **Expense Ratio**: The annual fee charged by the fund house. Lower is better (aim for <1%).

## Types of Mutual Funds

| Type | Risk | Ideal For |
|------|------|----------|
| Equity (Large Cap) | Moderate | 5+ year goals |
| Equity (Small Cap) | High | 7+ years, high returns |
| Debt Funds | Low | Short-term, stability |
| Hybrid / Balanced | Moderate | Balanced risk profile |
| ELSS | Moderate | Tax saving + growth |

## How to Start

1. Complete your KYC (Aadhaar + PAN)
2. Choose a platform (Zerodha Coin, Groww, MFU)
3. Start with a Large Cap or Index fund
4. Set up a monthly SIP of at least ₹500
5. Review annually — don't check daily!

> *"The best time to start investing was yesterday. The second best time is now."*
""",
                "contentType": "markdown",
                "section": "Knowledge Base",
                "folder": "Beginner Basics",
                "category": "Investment Strategies",
                "readTime": 5,
                "tags": "mutual funds, SIP, NAV, beginner, equity, debt",
                "status": "Published",
                "authors": [admin_name],
                "created_at": datetime.utcnow(),
                "read_count": 0
            },
            {
                "title": "Your First Budget: The Step-by-Step Beginner's Blueprint",
                "description": "Never budgeted before? This hands-on guide walks you through creating your first monthly budget from scratch — tracking income, categorizing expenses, and finding hidden savings.",
                "content": """# Your First Budget: The Step-by-Step Beginner's Blueprint

Budgeting sounds boring — but it's actually your most powerful tool for taking control of your financial life.

## Step 1: Know Your Income

List all sources of income after tax:
- Salary / Freelance income
- Any side hustle earnings
- Rental income, dividends

## Step 2: List ALL Your Expenses

For one month, track every single rupee. Use categories:

**Fixed Expenses (same every month):**
- Rent / EMI
- Insurance premiums
- Subscriptions (Netflix, Spotify, gym)

**Variable Expenses (change month to month):**
- Groceries & food
- Fuel & transport
- Shopping & entertainment

## Step 3: Calculate Your Surplus (or Deficit)

```
Surplus = Total Income - Total Expenses
```

If it's negative, you're spending more than you earn. Time to cut costs!

## Step 4: Assign Money with Purpose

Every rupee should have a "job":
- Emergency fund top-up
- SIP investment
- Goal savings (vacation, gadget, down payment)

## Step 5: Review Monthly

Budgets aren't set in stone. Revisit them every month and adjust as needed.

## Tools You Can Use
- **Finance Buddy CashBook** – Track all your transactions in one place
- **Finance Buddy Budget Maker** – Plan future months visually

> *"A budget is telling your money where to go instead of wondering where it went."* — Dave Ramsey
""",
                "contentType": "markdown",
                "section": "Knowledge Base",
                "folder": "Beginner Basics",
                "category": "Personal Finance Tips",
                "readTime": 5,
                "tags": "budget, beginner, expenses, income, tracking, savings",
                "status": "Published",
                "authors": [admin_name],
                "created_at": datetime.utcnow(),
                "read_count": 0
            },
            {
                "title": "The Emergency Fund: Why You Need One and How to Build It Fast",
                "description": "An emergency fund is your financial safety net. Learn why 3–6 months of expenses is the golden rule, where to park your fund, and simple tricks to build it faster than you think.",
                "content": """# The Emergency Fund: Why You Need One and How to Build It Fast

Before you invest a single rupee, you need one thing in place: an **emergency fund**.

## What is an Emergency Fund?

It's a dedicated pool of liquid money reserved strictly for unexpected situations:
- Job loss or pay cut
- Medical emergencies
- Urgent home or vehicle repairs
- Family crises

It is **NOT** for vacations, shopping sales, or "good deals".

## How Much is Enough?

| Your Situation | Recommended Fund |
|---------------|------------------|
| Single, stable job | 3 months expenses |
| Married, single income | 6 months expenses |
| Self-employed / Freelance | 9–12 months expenses |

## Where to Keep It

- **High-interest Savings Account** – Liquid and earns interest
- **Liquid Mutual Fund** – Better returns, redeemable in 1 day
- **Avoid**: Stocks, locked FDs, or spending accounts

## How to Build It Faster

1. **Start small**: Even ₹1,000/month is a start
2. **Automate it**: Set up a recurring transfer on salary day
3. **Redirect windfalls**: Bonus? Tax refund? Put 50% here
4. **Sell unused items**: Declutter and fund your safety net

## The Peace of Mind It Buys

Knowing you have 6 months of runway completely changes how you approach risk, career decisions, and investing. It's not just money — it's **freedom**.
""",
                "contentType": "markdown",
                "section": "Both",
                "folder": "Beginner Basics",
                "category": "Savings",
                "readTime": 5,
                "tags": "emergency fund, savings, liquid, safety net, financial security",
                "status": "Published",
                "authors": [admin_name],
                "created_at": datetime.utcnow(),
                "read_count": 0
            },
        ]
        await db.articles.insert_many(seed_articles)
        print(f"[Seed] Inserted {len(seed_articles)} default articles.")

    # Auto-initialize RAG system
    # Use saved settings if available, otherwise use defaults
    try:
        from app.rag.engine import rag_system
        from app.rag.router import _sanitize_settings

        saved_settings = await db.chat_settings.find_one({"admin_id": "global"})
        if saved_settings:
            # Fix any deprecated model names stored in MongoDB
            saved_settings = _sanitize_settings(dict(saved_settings))
            rag_system.initialize(
                rag_folder_path=saved_settings.get("rag_folder_path", ""),
                provider=saved_settings.get("provider", "gemini"),
                ai_model=saved_settings.get("ai_model", "gemini-2.0-flash"),
                embedding_model=saved_settings.get("embedding_model", "gemini-embedding-001"),
                ollama_endpoint=saved_settings.get("ollama_endpoint", ""),
                temperature=saved_settings.get("temperature", 0.7),
                max_tokens=saved_settings.get("max_tokens", 4096),
                system_prompt=saved_settings.get("system_prompt", "You are Finance Buddy, an expert Indian CA and AI financial advisor. Provide concise, polite financial strategies using the provided context and RAG documents. Use Indian IT Act (FY 2025-26) for tax. Evaluate goal feasibility via 'BankBalances' and suggest actionable steps. Use simple English, avoid specific stock tips, and state clearly if data is insufficient."),
                chunk_size=saved_settings.get("chunk_size", 1000),
                top_k=saved_settings.get("top_k", 5),
            )
            rag_folder = saved_settings.get("rag_folder_path", "")
            if rag_folder:
                rag_system.build_or_update_vectorstore(rag_folder)
            print("[RAG] Auto-initialized from saved DB settings.")
        else:
            # Initialize with defaults even without saved settings
            rag_system.initialize()
            print("[RAG] Auto-initialized with default settings (no admin config needed).")
    except Exception as e:
        print(f"[RAG] Auto-initialization failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(tax_profile.router, prefix=f"{settings.API_V1_STR}/tax_profile", tags=["tax_profiles"])
app.include_router(cashbook.router, prefix=f"{settings.API_V1_STR}/cashbook", tags=["cashbook"])
app.include_router(communication.router, prefix=f"{settings.API_V1_STR}/communication", tags=["communication"])
app.include_router(sync.router, prefix=f"{settings.API_V1_STR}/sync", tags=["sync"])
app.include_router(chatbot_router.router, prefix=f"{settings.API_V1_STR}/chatbot", tags=["chatbot"])
app.include_router(market.router, prefix=f"{settings.API_V1_STR}/market", tags=["market"])
app.include_router(roles.router, prefix=f"{settings.API_V1_STR}/roles", tags=["roles"])
app.include_router(articles.router, prefix=f"{settings.API_V1_STR}/articles", tags=["articles"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Finance Buddy API"}

@app.get("/health")
async def health():
    return {"status": "ok"}
