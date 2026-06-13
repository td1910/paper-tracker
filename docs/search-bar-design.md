# Design Document: Search Bar Feature

## 1. Problem Statement
Users need a way to find specific papers based on keywords (e.g., searching for "Transformer" or a specific author). The backend API `GET /api/papers/search?q=keyword` exists, but there is no frontend UI to interact with it.

## 2. Proposed Solution
Add a clean, responsive Search Input inside the top Navbar of the Dashboard. When a user types a query and submits, the frontend will call the search API and replace the current feed with the search results.

## 3. Architecture & Technical Details

### Frontend Changes
- **Navbar (`page.tsx`):**
  - Inject an `<input type="text" />` element into the center of the navbar.
  - Add state: `const [searchQuery, setSearchQuery] = useState('')`.
  - Add a form submit handler `handleSearch` that triggers when the user hits Enter or clicks a search icon.
- **Feed Logic (`page.tsx`):**
  - When the user submits a search query, the frontend will call the existing `GET /api/papers/search?q={query}` endpoint.
  - The results from the API will replace the current `papers` state.
  - This approach guarantees scalability. Even when pagination and thousands of papers are introduced later, the backend will securely and efficiently query the database (e.g. `LIKE %keyword%`) rather than overwhelming the browser memory.
  - If the search query is cleared, the dashboard will simply re-fetch the standard `GET /api/papers` feed.

## 4. Testing Plan
- Type "AI" in the search box -> verify feed instantly filters to papers with "AI" in title/abstract.
- Clear search box -> verify original feed returns.
- Combine Search + "My Favorites" filter -> verify it only searches within saved papers.
