# Design Document: Gợi ý paper liên quan (Suggest Related Papers)

## 1. Problem Statement
To fulfill the advanced requirement (+2 points), the system must suggest papers that are semantically or contextually related to a specific paper the user is viewing.

## 2. Proposed Solution
1. **Frontend:** Add a "Related Papers" (Các bài viết liên quan) button to the bottom of each `PaperCard`. Clicking it expands a small section directly below the card showing 2-3 similar papers.
2. **Backend API:** Create a new endpoint `GET /api/papers/:id/related`.
3. **Algorithm:** Since we don't have a Vector Database running yet, we will implement a hybrid heuristic search:
   - **Step 1:** Find papers that share the same `topics` as the target paper.
   - **Step 2:** From that subset, calculate a simple "similarity score" by counting how many significant words from the target paper's title also appear in the candidate paper's title or abstract.
   - **Step 3:** Return the top 3 highest-scoring papers (excluding the target paper itself).

*(Note: In the future, this endpoint can easily be upgraded to use Gemini Embeddings for true semantic search without changing the frontend).*

## 3. Architecture & Technical Details

### Backend
- File: `server/src/routes/papers.ts`
- Add route: `router.get('/:id/related', async (req, res) => { ... })`
- Logic:
  1. Fetch the target paper by `id` (include its topics).
  2. Extract meaningful words from its title (ignoring stop words like "a", "the", "and", "in", "of", "for").
  3. Fetch all other papers that share at least one topic with the target.
  4. Sort them in memory by how many meaningful words they share.
  5. Slice the top 3 and return them.

### Frontend
- File: `client/src/components/papers/PaperCard.tsx`
- Add state: `const [relatedPapers, setRelatedPapers] = useState<Paper[] | null>(null)`
- Add state: `const [isLoadingRelated, setIsLoadingRelated] = useState(false)`
- Add a button "Show Related Papers".
- `onClick`: `fetch('/api/papers/${paper.id}/related')` -> map the results to a mini list (just Title and Date).

## 4. Testing Plan
1. Find a paper about "Language Models".
2. Click "Show Related".
3. Verify it returns 2-3 other papers that have overlapping topics or title keywords.
