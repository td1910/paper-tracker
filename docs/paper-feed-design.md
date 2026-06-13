# Design Document: ArXiv Fetcher and Paper Feed

## 1. Problem Statement
The core value of the application is providing users with relevant research papers. Before we can filter or manage topics extensively, we need the system to be capable of fetching real papers from arXiv, saving them to our database, and displaying them in a readable feed on the frontend.

## 2. Proposed Solution
We will build the **ArXiv Fetcher Service** to pull the latest papers from a default category (e.g., `cs.AI` - Artificial Intelligence). We will also build the **Paper Feed UI** on the frontend Dashboard to display these newly fetched papers.

## 3. Architecture & Technical Details

### Backend Changes (`server/src/services/arxiv.ts` & `server/src/routes/papers.ts`)
- **Fetcher Logic**: Create a utility function that queries the arXiv Atom API.
  - Example Query: `http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=desc&max_results=10`
- **XML Parsing**: Use the `fast-xml-parser` library to convert the arXiv XML response into JSON.
- **Database Storage**: Iterate over the fetched papers and use `prisma.paper.upsert` to save them to the SQLite database without creating duplicates (matching on `arxivId`).
- **Cron Job**: Implement a daily cron job using `node-cron` to automatically run the fetcher service every day.
- **API Route**: Enhance the `GET /api/papers` route to return papers sorted by `publishedDate` descending.

### Frontend Changes (`client/src/app/dashboard/page.tsx` & Components)
- **Paper Feed**: Update the Dashboard to fetch from `/api/papers`.
- **PaperCard Component**: A new UI component that displays:
  - Title (bold, clickable link to original arXiv page)
  - Authors (comma-separated)
  - Published Date
  - Abstract (truncated to 3-4 lines with a "Read More" button)

## 4. External Dependencies
- **arXiv API**: `export.arxiv.org/api`
- **`fast-xml-parser`** & **`axios`** (Already installed on the server)

## 5. Testing Plan
1.  **Manual Fetch Trigger**: We will temporarily create a route like `GET /api/papers/fetch-now` so we can manually trigger the fetcher for testing without waiting for a cron job.
2.  **Database Verification**: Verify that clicking the fetch route populates the `Paper` table in SQLite.
3.  **UI Verification**: Load the Dashboard and ensure the papers are rendered correctly in the new `PaperCard` layout.

## 6. Risks & Alternatives
- **Risk**: arXiv API limits requests. If we fetch too aggressively, we could get temporarily blocked.
- **Alternative**: We will restrict our manual fetches to a maximum of 10-20 papers per request to ensure we stay well within rate limits during development.
