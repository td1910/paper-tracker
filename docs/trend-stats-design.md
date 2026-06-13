# Design Document: Thống kê xu hướng theo chủ đề (Trend Stats)

## 1. Problem Statement
To fulfill the advanced requirement (+2 points), the system needs to provide visual statistics showing which topics are trending (i.e., which topics have the most papers published).

## 2. Proposed Solution
Create a dedicated "Trends" dashboard (`/trends`). It will fetch aggregated data from the database and display a beautiful, interactive Bar Chart showing the volume of papers per topic. To keep the project lightweight and fast, we will build a custom CSS Bar Chart using Tailwind rather than installing heavy external charting libraries.

## 3. Architecture & Technical Details

### Backend Changes
- **New Endpoint:** `GET /api/topics/trends` in `server/src/routes/topics.ts`.
- **Query Logic:** 
  - Query `prisma.topic.findMany({ include: { papers: true } })`.
  - Transform the data to return an array of objects: `{ id, name, count }`.
  - Sort the array descending by `count` so the most popular topics appear first.

### Frontend Changes
- **New Page (`client/src/app/trends/page.tsx`):**
  - Fetch the data from `/api/topics/trends` on mount.
  - Find the `maxCount` to calculate percentages for the bar chart widths.
  - Render a clean UI: A list of topics where each row has the topic name, the exact number of papers, and a smooth animated Tailwind horizontal bar `style={{ width: \`${(count / maxCount) * 100}%\` }}`.
- **Global Navigation:**
  - Add a "Trends 📈" link to the main Dashboard Navbar (next to the Login/Logout buttons) so users can easily switch between the Feed and the Stats.

## 4. Testing Plan
1. Click "Trends 📈" in the Navbar.
2. Verify the page loads and displays horizontal bars for all 9 topics.
3. Verify the topics are sorted from most papers to least papers.
4. Verify the UI is responsive.
