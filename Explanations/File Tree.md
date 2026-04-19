┣ 📂Backend
┃ ┣ 📂app
┃ ┃ ┣ 📂api
┃ ┃ ┃ ┣ 📜articles.py
┃ ┃ ┃ ┣ 📜auth.py
┃ ┃ ┃ ┣ 📜cashbook.py
┃ ┃ ┃ ┣ 📜communication.py
┃ ┃ ┃ ┣ 📜deps.py
┃ ┃ ┃ ┣ 📜market.py
┃ ┃ ┃ ┣ 📜roles.py
┃ ┃ ┃ ┣ 📜sync.py
┃ ┃ ┃ ┣ 📜tax_profile.py
┃ ┃ ┃ ┗ 📜users.py
┃ ┃ ┣ 📂core
┃ ┃ ┃ ┣ 📜config.py
┃ ┃ ┃ ┗ 📜security.py
┃ ┃ ┣ 📂db
┃ ┃ ┃ ┗ 📜mongodb.py
┃ ┃ ┣ 📂models
┃ ┃ ┃ ┣ 📜article.py
┃ ┃ ┃ ┣ 📜cashbook.py
┃ ┃ ┃ ┣ 📜communication.py
┃ ┃ ┃ ┗ 📜user.py
┃ ┃ ┣ 📂rag
┃ ┃ ┃ ┣ 📜__init__.py
┃ ┃ ┃ ┣ 📜engine.py
┃ ┃ ┃ ┣ 📜models.py
┃ ┃ ┃ ┗ 📜router.py
┃ ┃ ┗ 📜main.py
┃ ┣ 📜.env
┃ ┣ 📜Details.md
┃ ┗ 📜requirements.txt
┣ 📂Explanations
┃ ┣ 📜Chatbot Details.md
┃ ┣ 📜Classes Details.md
┃ ┗ 📜Database_Schema.md
┣ 📂frontend
┃ ┣ 📂public
┃ ┃ ┣ 📜file.svg
┃ ┃ ┣ 📜Gemini_Generated_Image_3cttwu3cttwu3ctt compressed.png
┃ ┃ ┣ 📜globe.svg
┃ ┃ ┣ 📜hero-dashboard.png
┃ ┃ ┣ 📜next.svg
┃ ┃ ┣ 📜vercel.svg
┃ ┃ ┗ 📜window.svg
┃ ┣ 📂src
┃ ┃ ┣ 📂app
┃ ┃ ┃ ┣ 📂admin
┃ ┃ ┃ ┃ ┣ 📂articles
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂chatbot
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂feedback
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂notes
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂reminders
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂reports
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂roles
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂settings
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂users
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📜layout.js
┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┣ 📂api
┃ ┃ ┃ ┃ ┣ 📂articles
┃ ┃ ┃ ┃ ┃ ┗ 📜route.js
┃ ┃ ┃ ┃ ┗ 📂rag-docs
┃ ┃ ┃ ┃   ┣ 📂download
┃ ┃ ┃ ┃   ┃ ┗ 📜route.js
┃ ┃ ┃ ┃   ┗ 📜route.js
┃ ┃ ┃ ┣ 📂articles
┃ ┃ ┃ ┃ ┗ 📂[slug]
┃ ┃ ┃ ┃   ┗ 📜page.js
┃ ┃ ┃ ┣ 📂dashboard
┃ ┃ ┃ ┃ ┣ 📂about
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂budget
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂cashbook
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂chat
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂goals
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂learn
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂notes
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂reminders
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂settings
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📜layout.js
┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┣ 📂editor
┃ ┃ ┃ ┃ ┣ 📂articles
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂chatbot
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂notes
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂reminders
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂settings
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📂users
┃ ┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┃ ┣ 📜layout.js
┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┣ 📂login
┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┣ 📂signup
┃ ┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┃ ┣ 📜favicon.ico
┃ ┃ ┃ ┣ 📜globals.css
┃ ┃ ┃ ┣ 📜layout.tsx
┃ ┃ ┃ ┗ 📜page.js
┃ ┃ ┣ 📂components
┃ ┃ ┃ ┣ 📂goals
┃ ┃ ┃ ┃ ┣ 📜FilterBar.jsx
┃ ┃ ┃ ┃ ┣ 📜GoalCard.jsx
┃ ┃ ┃ ┃ ┗ 📜GoalModal.jsx
┃ ┃ ┃ ┣ 📂notes
┃ ┃ ┃ ┃ ┗ 📜NotesManager.jsx
┃ ┃ ┃ ┣ 📜AdminCheatcodeListener.jsx
┃ ┃ ┃ ┣ 📜AdminLayoutClient.jsx
┃ ┃ ┃ ┣ 📜AdminSidebar.jsx
┃ ┃ ┃ ┣ 📜AdminSidebarWrapper.jsx
┃ ┃ ┃ ┣ 📜ArticleEditorForm.jsx
┃ ┃ ┃ ┣ 📜ArticleGrid.jsx
┃ ┃ ┃ ┣ 📜ArticleModal.jsx
┃ ┃ ┃ ┣ 📜ArticleSection.jsx
┃ ┃ ┃ ┣ 📜BackendGuard.jsx
┃ ┃ ┃ ┣ 📜ContactSection.jsx
┃ ┃ ┃ ┣ 📜DashboardLayoutClient.jsx
┃ ┃ ┃ ┣ 📜EditorLayoutClient.jsx
┃ ┃ ┃ ┣ 📜EditorSidebar.jsx
┃ ┃ ┃ ┣ 📜EditorSidebarWrapper.jsx
┃ ┃ ┃ ┣ 📜FeaturesSection.jsx
┃ ┃ ┃ ┣ 📜FYPicker.jsx
┃ ┃ ┃ ┣ 📜HeroCTA.jsx
┃ ┃ ┃ ┣ 📜HeroVisual.jsx
┃ ┃ ┃ ┣ 📜MarketTicker.jsx
┃ ┃ ┃ ┣ 📜Navbar.jsx
┃ ┃ ┃ ┣ 📜NotesDrawer.jsx
┃ ┃ ┃ ┣ 📜RAGDocsViewer.jsx
┃ ┃ ┃ ┣ 📜ReindexProgressBubble.jsx
┃ ┃ ┃ ┣ 📜RightSidebar.jsx
┃ ┃ ┃ ┣ 📜Sidebar.jsx
┃ ┃ ┃ ┣ 📜SmoothScroll.jsx
┃ ┃ ┃ ┣ 📜SystemGuardian.jsx
┃ ┃ ┃ ┣ 📜TestChatbotDrawer.jsx
┃ ┃ ┃ ┗ 📜ViewCounter.jsx
┃ ┃ ┣ 📂contents
┃ ┃ ┃ ┣ 📜tax-saving-strategies.md
┃ ┃ ┃ ┗ 📜understanding-mutual-funds.md
┃ ┃ ┣ 📂context
┃ ┃ ┃ ┣ 📜CashBookContext.jsx
┃ ┃ ┃ ┣ 📜FeedbackContext.jsx
┃ ┃ ┃ ┣ 📜FinancialYearContext.jsx
┃ ┃ ┃ ┣ 📜PermissionsContext.jsx
┃ ┃ ┃ ┣ 📜RemindersContext.jsx
┃ ┃ ┃ ┗ 📜UsersContext.jsx
┃ ┃ ┗ 📂lib
┃ ┃   ┣ 📜api.js
┃ ┃   ┗ 📜articles.js
┃ ┣ 📜.env.local
┃ ┣ 📜.gitignore
┃ ┣ 📜eslint.config.mjs
┃ ┣ 📜next-env.d.ts
┃ ┣ 📜next.config.ts
┃ ┣ 📜package.json
┃ ┣ 📜postcss.config.mjs
┃ ┣ 📜README.md
┃ ┗ 📜tsconfig.json
┣ 📂RAG_Source_Docs
┃ ┣ 📂Income_Tax_Rules
┃ ┃ ┗ 📜income tax basics.txt
┃ ┣ 📜budgeting_101.md
┃ ┣ 📜investment_basics.md
┃ ┣ 📜tax_planning_strategies.md
┃ ┗ 📜Tricks and tips.md
┣ 📜.gitignore
┣ 📜File Tree.md
┣ 📜launcher.bat
┣ 📜notes.txt
┣ 📜README.md
┗ 📜sync.ffs_db
