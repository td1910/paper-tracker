# Automated AI Paper Tracker 📚✨

A full-stack, automated web application built for researchers and students to track, categorize, and summarize the latest research papers from arXiv using Artificial Intelligence.

## 🌟 Key Features & Bonus Requirements Completed

This project successfully implements the core requirements and **exceeds expectations by fulfilling 3 major Bonus Features**:

1. **Thống kê xu hướng theo chủ đề (Trending Topics & Stats):**
   - A dedicated "Trends 📈" dashboard page dynamically calculates the hottest papers across all topics based on user favorites and interactions.
   
2. **Chấm điểm paper đáng đọc (AI Readability Score & Summarization):**
   - Fully integrated with the **Google Gemini 2.5 AI API**.
   - Background batch processors automatically read incoming paper abstracts, translate/summarize them into plain English, and score them out of 10 for readability.
   
3. **Gửi thông báo khi có paper mới (In-App Notifications):**
   - A real-time notification system alerts users when the automated background `cron` jobs discover new papers for the topics they follow.
   - Includes a sleek dropdown UI with unread badges.

### Core Features
* **Automated ArXiv Fetcher:** Background `cron` jobs automatically download the latest research papers every 12 hours based on user topic preferences.
* **Topic Management:** Users can subscribe/follow specific research topics (e.g., "Computer Vision", "Machine Learning").
* **Favorites System:** Bookmark papers to read later.
* **Advanced Search & Filtering:** Filter the feed by topic or search by keyword.
* **JWT Authentication:** Secure user registration and login.

## 🏗️ Architecture & Documentation

We used a strict **Design-First Workflow**. You can read our architectural design decisions in the `/docs` folder:
* [Architecture Design](docs/architecture.md)
* [Database Design](docs/database.md)
* [AI Scoring Design](docs/gemini-ai-scoring-design.md)
* [Notifications Design](docs/notifications-design.md)

### Tech Stack
* **Frontend:** Next.js (React), TailwindCSS
* **Backend:** Node.js, Express, TypeScript
* **Database:** Prisma ORM, SQLite
* **AI:** Google GenAI SDK (Gemini 2.5 Flash)

## 🚀 Getting Started

### 1. Start the Backend Server
```bash
cd server
npm install
npx prisma generate
npx nodemon src/index.ts
```

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```

### 3. Usage
Navigate to `http://localhost:3000` in your browser. Create an account, follow some topics, and click **"Fetch New Papers"** to see the background AI jobs in action!
