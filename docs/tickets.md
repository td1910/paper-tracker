# Project Tracking (Jira-style Tickets)

## Sprint 1: Topic Management
**TICKET-1: Topic Tracking Backend**
- **Description:** Implement backend logic for users to manage the topics they follow. Users can add a topic to their tracking list, modify their tracking parameters (e.g., specific keywords within that topic), and remove a topic from their list.
- **Tasks:**
  - Update `docs/topic-management-design.md` to clarify the "Tracking" workflow.
  - Implement/Fix backend routes to handle adding, modifying, and deleting user topic tracking records.
  - Fix TDD tests in `topics.test.ts`.
- **Status:** TO DO

**TICKET-2: Topic Tracking UI**
- **Description:** Build the frontend interface for users to manage the topics they follow.
- **Tasks:**
  - Create a "Followed Topics" section on the Dashboard.
  - Implement a UI to browse available topics and "Add" them to the tracking list.
  - Implement UI to "Remove" or "Edit" (e.g., add personal keywords) a tracked topic.
- **Status:** TO DO

## Sprint 2: Data Ingestion & Summarization
**TICKET-3: ArXiv Fetcher Service**
- **Description:** Automatically fetch new papers based on user topic keywords.
- **Tasks:**
  - Implement a service using `axios` and `fast-xml-parser` to query the arXiv API.
  - Create a `node-cron` job to run periodically.
  - Save papers to DB: title, abstract, authors, date, link.
  - Prevent duplicates using `arxivId`.
- **Status:** TO DO

**TICKET-4: AI Summarization Integration**
- **Description:** Summarize the abstract of incoming papers.
- **Tasks:**
  - Integrate Google Gemini API.
  - Write a prompt to extract a 2-3 sentence summary from the abstract.
  - Trigger summarization before saving a new paper to the DB.
- **Status:** TO DO

## Sprint 3: Feed, Search, and Favorites
**TICKET-5: Paper Feed UI & Details Page**
- **Description:** Display the fetched papers to the user.
- **Tasks:**
  - Create the main Feed UI displaying paper cards (with summaries).
  - Create a detailed view page (`/paper/[id]`) showing the full abstract and metadata.
- **Status:** TO DO

**TICKET-6: Search and Filter API & UI**
- **Description:** Allow users to find specific papers.
- **Tasks:**
  - Fix TDD test for backend search logic (`/api/papers/search`).
  - Add search bar to the frontend.
  - Implement filtering by specific Topic.
- **Status:** TO DO

**TICKET-7: Favorites System**
- **Description:** Allow users to save papers to read later.
- **Tasks:**
  - Implement backend routes to add/remove favorites.
  - Add "Bookmark/Heart" button to Paper cards in the UI.
  - Create a "Favorites" tab on the Dashboard.
- **Status:** TO DO
